"""Generate an idempotent Supabase migration from the supplied XLSX (stdlib only)."""
import argparse
import hashlib
import json
from pathlib import Path
import uuid
import xml.etree.ElementTree as ET
import zipfile

FIELDS = ['food_name', 'latin_name', 'active_ingredient', 'pharmacological_effect', 'interacting_drugs', 'mechanism', 'onset', 'risk_groups', 'management', 'sources', 'updated_at_source']

def extract(path):
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as archive:
        strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            strings = [''.join(n.itertext()) for n in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('m:si', ns)]
        rows = ET.fromstring(archive.read('xl/worksheets/sheet1.xml')).findall('.//m:sheetData/m:row', ns)
        for row in rows[1:]:
            values = [''] * len(FIELDS)
            for cell in row:
                col = ''.join(c for c in cell.attrib['r'] if c.isalpha())
                index = 0
                for c in col:
                    index = index * 26 + ord(c) - 64
                value = cell.find('m:v', ns)
                text = value.text if value is not None else ''.join(cell.itertext())
                if cell.attrib.get('t') == 's':
                    text = strings[int(text)]
                if index <= len(values):
                    values[index - 1] = (text or '').strip()
            if values[0]:
                yield dict(zip(FIELDS, values))

def generate(source, output):
    rows = list(extract(source))
    quote = lambda value: "'" + value.replace("'", "''") + "'"
    sql = '-- Imported source SHA256: ' + hashlib.sha256(Path(source).read_bytes()).hexdigest() + '\n'
    sql += 'CREATE TABLE IF NOT EXISTS public.food_interactions (\n id uuid PRIMARY KEY,\n' + ',\n'.join(' '+f+' text NOT NULL DEFAULT '+quote('') for f in FIELDS) + '\n);\n'
    sql += '''ALTER TABLE public.food_interactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.food_interactions TO authenticated;
REVOKE ALL ON public.food_interactions FROM anon;
CREATE POLICY "Authenticated users can read food interactions" ON public.food_interactions FOR SELECT TO authenticated USING (true);
CREATE INDEX food_interactions_name_idx ON public.food_interactions (food_name);
'''
    for row in rows:
        key = str(uuid.uuid5(uuid.NAMESPACE_URL, json.dumps(row, ensure_ascii=False, sort_keys=True)))
        sql += 'INSERT INTO public.food_interactions (id, '+', '.join(FIELDS)+') VALUES ('+', '.join(quote(v) for v in [key, *row.values()])+') ON CONFLICT (id) DO NOTHING;\n'
    Path(output).write_text(sql)
    print(f'{len(rows)} source rows imported into {output}')
    print('Banana matches:', [(r['food_name'],r['latin_name']) for r in rows if 'banana' in r['latin_name'].lower() or r['food_name'].lower() == 'muz'])

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source'); parser.add_argument('output')
    args = parser.parse_args()
    generate(args.source, args.output)

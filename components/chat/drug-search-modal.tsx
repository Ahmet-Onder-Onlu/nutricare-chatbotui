import { FC, useEffect, useState } from "react"
import { searchCatalog, FoodInteraction, NutricareEntry } from "@/db/nutricare"
import { useDebounce } from "../../lib/hooks/use-debounce"
import { IconSearch, IconX } from "@tabler/icons-react"

interface DrugSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DrugSearchModal: FC<DrugSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<NutricareEntry[]>([])
  const [selectedDrug, setSelectedDrug] = useState<NutricareEntry | null>(null)
  const [foods, setFoods] = useState<FoodInteraction[]>([])
  const [searchError, setSearchError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    let active = true
    setSelectedDrug(null)
    setSearchResults([])
    setFoods([])
    setSearchError("")
    if (!isOpen || !debouncedSearch.trim()) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    searchCatalog(debouncedSearch)
      .then(({ drugs, foods: foodResults }) => {
        if (!active) return
        setSearchResults(drugs || [])
        setFoods(foodResults)
      })
      .catch(() => {
        if (active)
          setSearchError(
            "Arama yapılamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin."
          )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [debouncedSearch, isOpen])

  const handleClose = () => {
    setFoods([])
    setSearchError("")
    setSearchQuery("")
    setSearchResults([])
    setSelectedDrug(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur background overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal content */}
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Close button */}
        <button
          aria-label="Kapat"
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IconX size={24} />
        </button>

        {/* Title */}
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Besin ve İlaç Arama
        </h2>

        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            aria-label="Besin veya ilaç adı"
            placeholder="Besin veya ilaç adı girin..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
          />
          <IconSearch
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLoading ? "animate-spin" : ""} text-gray-400`}
            size={20}
          />
        </div>

        <p className="mb-3 text-xs text-gray-500">
          En alakalı en fazla 5 sonuç gösterilir.
        </p>
        {/* Search results */}
        <div className="mb-6 max-h-[200px] overflow-y-auto">
          {searchResults.map(drug => (
            <div
              key={drug.id}
              onClick={() => setSelectedDrug(drug)}
              className="cursor-pointer rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {drug.drug}
              </div>
            </div>
          ))}
          {searchQuery === debouncedSearch &&
            searchQuery &&
            !isLoading &&
            !searchError &&
            searchResults.length === 0 &&
            foods.length === 0 && (
              <div className="p-3 text-gray-500 dark:text-gray-400">
                Eşleşen besin veya ilaç bulunamadı. Bu, etkileşim olmadığı
                anlamına gelmez.
              </div>
            )}
        </div>

        <div aria-live="polite">
          {isLoading && (
            <p className="mb-4 text-sm text-gray-500">Aranıyor...</p>
          )}
          {searchError && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {searchError}
            </p>
          )}
        </div>
        <div className="space-y-4">
          {foods.map(food => (
            <article
              key={food.id}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold">{food.food_name}</h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {food.latin_name}
              </p>
              <dl className="space-y-3 text-sm">
                {(
                  [
                    ["Etken madde", food.active_ingredient],
                    ["Farmakolojik etki", food.pharmacological_effect],
                    ["Etkileşen ilaçlar", food.interacting_drugs],
                    ["Etkileşim mekanizması ve sonucu", food.mechanism],
                    ["Başlangıç zamanı", food.onset],
                    ["Riskli hasta grupları", food.risk_groups],
                    ["Yönetim", food.management],
                    ["Kaynaklar", food.sources],
                    ["Güncelleme tarihi", food.updated_at_source]
                  ] as const
                )
                  .filter(([, value]) => value && value !== "X")
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </dt>
                      <dd className="whitespace-pre-wrap break-words text-gray-600 dark:text-gray-400">
                        {value}
                      </dd>
                    </div>
                  ))}
                {!food.interacting_drugs && (
                  <p className="text-gray-500">
                    Bu kaynak satırında ilaç etkileşimi bilgisi belirtilmemiş.
                  </p>
                )}
              </dl>
            </article>
          ))}
        </div>

        {/* Selected drug details */}
        {selectedDrug && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDrug.drug}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Aktif Madde
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedDrug.active_sub}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Yan Etkiler
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedDrug.side_effect}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Kaçınılması Gerekenler
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedDrug.avoid_consume}
                </p>
              </div>
              {selectedDrug.note && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Notlar
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedDrug.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { FC, useEffect, useState } from "react"
import { getDrugDetails, searchDrugs, NutricareEntry } from "@/db/nutricare"
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
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchDrugs = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([])
        setSelectedDrug(null)
        return
      }

      console.log("Starting search with query:", debouncedSearch)
      setIsLoading(true)
      try {
        const results = await searchDrugs(debouncedSearch)
        console.log("Search completed. Results:", results)
        setSearchResults(results || [])
        setSelectedDrug(null)
      } catch (error) {
        console.error("Error in fetchDrugs:", error)
        setSearchResults([])
        setSelectedDrug(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrugs()
  }, [debouncedSearch])

  const handleDrugSelect = async (drug: NutricareEntry) => {
    console.log("Selected drug:", drug)
    setSelectedDrug(drug)
  }

  const handleClose = () => {
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
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IconX size={24} />
        </button>

        {/* Title */}
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          İlaç Arama
        </h2>

        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="İlaç adı girin..."
            value={searchQuery}
            onChange={e => {
              console.log("Search input changed:", e.target.value)
              setSearchQuery(e.target.value)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
          />
          <IconSearch
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLoading ? "animate-spin" : ""} text-gray-400`}
            size={20}
          />
        </div>

        {/* Search results */}
        <div className="mb-6 max-h-[200px] overflow-y-auto">
          {searchResults.map(drug => (
            <div
              key={drug.id}
              onClick={() => handleDrugSelect(drug)}
              className="cursor-pointer rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {drug.drug}
              </div>
            </div>
          ))}
          {searchQuery && !isLoading && searchResults.length === 0 && (
            <div className="p-3 text-gray-500 dark:text-gray-400">
              İlaç bulunamadı
            </div>
          )}
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

import { IconSearch } from "@tabler/icons-react"
import { FC, useState } from "react"
import { DrugSearchModal } from "./drug-search-modal"

interface SearchButtonProps {}

export const SearchButton: FC<SearchButtonProps> = ({}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white shadow-sm transition-colors hover:bg-blue-600"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="whitespace-nowrap font-medium">Besin / İlaç Ara</span>
        <IconSearch size={16} strokeWidth={2.5} />
      </button>

      <DrugSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

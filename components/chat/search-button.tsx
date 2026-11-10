import { IconSearch } from "@tabler/icons-react"
import { FC, useState } from "react"
import { DrugSearchModal } from "./drug-search-modal"

interface SearchButtonProps {}

export const SearchButton: FC<SearchButtonProps> = ({}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        className="nc-gradient-bg flex min-h-[44px] cursor-pointer items-center space-x-2 rounded-xl px-3 py-2 text-sm text-white shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.03]"
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

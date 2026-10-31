/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Sidebar } from "@/components/sidebar/sidebar"
import { ChatbotUIContext } from "@/context/context"
import { createFolder } from "@/db/folders"
import { updateChat } from "@/db/chats"
jest.mock("@/components/chat/chat-hooks/use-chat-handler", () => ({
  useChatHandler: () => ({ handleNewChat: jest.fn() })
}))
jest.mock("@/components/sidebar/items/chat/chat-item", () => ({
  ChatItem: ({ chat }: any) => <div>{chat.name}</div>
}))
jest.mock("@/db/folders", () => ({
  createFolder: jest.fn(),
  updateFolder: jest.fn(),
  deleteFolder: jest.fn()
}))
jest.mock("@/db/chats", () => ({ updateChat: jest.fn() }))
const context = (chats: any[] = [], folders: any[] = []) => ({
  chats,
  folders,
  setChats: jest.fn(),
  setFolders: jest.fn(),
  profile: { user_id: "user1" },
  selectedWorkspace: { id: "workspace1" }
})
function show(value: any) {
  return render(
    <ChatbotUIContext.Provider value={value}>
      <Sidebar />
    </ChatbotUIContext.Provider>
  )
}
it("can create a folder even before the first chat", async () => {
  const state = context()
  ;(createFolder as jest.Mock).mockResolvedValue({
    id: "folder1",
    name: "Beslenme",
    type: "chats"
  })
  show(state)
  fireEvent.click(screen.getByRole("button", { name: "Yeni klasör" }))
  fireEvent.change(screen.getByRole("textbox", { name: "Klasör adı" }), {
    target: { value: "Beslenme" }
  })
  fireEvent.click(screen.getByRole("button", { name: "Kaydet" }))
  await waitFor(() =>
    expect(createFolder).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Beslenme",
        type: "chats",
        workspace_id: "workspace1"
      })
    )
  )
  expect(state.setFolders).toHaveBeenCalled()
})
it("supports moving chats to folders on touch devices without drag and drop", async () => {
  const chat = {
    id: "chat1",
    name: "Ananas",
    folder_id: null,
    created_at: "2026-10-31"
  }
  ;(updateChat as jest.Mock).mockResolvedValue({
    ...chat,
    folder_id: "folder1"
  })
  const state = context(
    [chat],
    [{ id: "folder1", name: "Beslenme", type: "chats" }]
  )
  show(state)
  fireEvent.change(
    screen.getByRole("combobox", { name: "Ananas sohbetini klasöre taşı" }),
    { target: { value: "folder1" } }
  )
  await waitFor(() =>
    expect(updateChat).toHaveBeenCalledWith("chat1", { folder_id: "folder1" })
  )
  expect(state.setChats).toHaveBeenCalled()
})

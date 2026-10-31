/** @jest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import { ChatSettings } from "@/components/chat/chat-settings"
import { ChatbotUIContext } from "@/context/context"
import { getUserApiKey, setUserApiKey } from "@/lib/client/user-api-key"
import { ResponseActivity } from "@/components/chat/response-activity"

const state: any = {
  chatSettings: { model: "gemini-3.5-flash-lite" },
  setChatSettings: jest.fn(),
  availableHostedModels: [
    {
      provider: "google",
      modelId: "gemini-3.5-flash-lite",
      modelName: "Gemini Flash Lite"
    }
  ]
}
afterEach(() => act(() => setUserApiKey("")))
it("shows exactly the two requested tabs without prompt or advanced controls", () => {
  render(
    <ChatbotUIContext.Provider value={state}>
      <ChatSettings />
    </ChatbotUIContext.Provider>
  )
  fireEvent.click(screen.getByRole("button", { name: "Model ve API ayarları" }))
  expect(screen.getAllByRole("tab")).toHaveLength(2)
  expect(screen.getByRole("tab", { name: "Model seçimi" })).toBeTruthy()
  expect(screen.getByRole("tab", { name: "API gir" })).toBeTruthy()
  expect(screen.queryByText("Advanced Settings")).toBeNull()
  expect(screen.queryByText("Prompt")).toBeNull()
})
it("does not persist a personal key in browser storage", () => {
  const local = jest.spyOn(Storage.prototype, "setItem")
  setUserApiKey("temporary-personal-key-12345")
  expect(getUserApiKey()).toBe("temporary-personal-key-12345")
  expect(local).not.toHaveBeenCalled()
  local.mockRestore()
})
it("stops drawing when the first response token arrives", () => {
  const view = render(
    <ChatbotUIContext.Provider
      value={{ ...state, isGenerating: true, firstTokenReceived: false }}
    >
      <ResponseActivity />
    </ChatbotUIContext.Provider>
  )
  expect(
    view.container.querySelector(".response-activity-waiting")
  ).not.toBeNull()
  view.rerender(
    <ChatbotUIContext.Provider
      value={{ ...state, isGenerating: true, firstTokenReceived: true }}
    >
      <ResponseActivity />
    </ChatbotUIContext.Provider>
  )
  expect(view.container.querySelector(".response-activity-waiting")).toBeNull()
})

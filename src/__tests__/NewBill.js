/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy()
    })
  })

  describe("When I am on NewBill Page", () => {
    test("Then the new bill's form should be loaded with its fields", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(screen.getByRole("button")).toBeTruthy();
    })


    test('Then I can select upload an image file', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock function handleChangeFile()
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });

      const mockHandleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const inputJustificative = screen.getByTestId("file");
      expect(inputJustificative).toBeTruthy();

      // Simulate if the file is an jpg extension
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          files: [new File(["file.jpg"], "file.jpg", { type: "file/jpg" })],
        },
      });

      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files[0].name).toBe("file.jpg");

      jest.spyOn(window, "alert").mockImplementation(() => { });
      expect(window.alert).not.toHaveBeenCalled();
    })

    test("Then I can't select upload a non image file", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock function handleChangeFile()
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });

      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputJustificative = screen.getByTestId("file");
      expect(inputJustificative).toBeTruthy();

      // Simulate if the file is wrong format and is not an jpg, png or jpeg extension
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });
      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files[0].name).not.toBe("file.jpg");

      jest.spyOn(window, "alert").mockImplementation(() => { });
      expect(window.alert).toHaveBeenCalled();
    })
  })
})

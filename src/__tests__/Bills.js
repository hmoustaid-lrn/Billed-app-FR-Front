/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I click on an eye icon', () => {
    test('Then, the modal should be display', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsContainer = new Bills({ document, onNavigate: null, store: null, localStorage: null })
      const modalMock = jest.fn()
      $.fn.modal = modalMock
      const iconEye0 = screen.getAllByTestId("icon-eye")[0]
      fireEvent.click(iconEye0)
      expect(modalMock).toHaveBeenCalledWith('show')
    })
  })
  describe('When I click on the new bill button', () => {
    test('Then, should navigate to the NewBill page', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: null })
      const newBillButton = screen.getByTestId('btn-new-bill')
      fireEvent.click(newBillButton)
      expect(screen.queryByTestId('form-new-bill')).toBeTruthy()
    })
  })
})

import voucherService from "../../src/services/voucherService"
import voucherRepository from "../../src/repositories/voucherRepository"
import * as voucherFactory from "../factories/voucherFactory"

describe("Criação de Voucher", () => {
  it("Desconto de 1% a 100% deve funcionar", async () => {
    const newVoucher = voucherFactory.CreateVoucher(0);
    const expectedDbVoucher = voucherFactory.CreateDBVoucher(newVoucher.code, newVoucher.discount);

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(null);
    jest.spyOn(voucherRepository, "createVoucher")
      .mockResolvedValueOnce(expectedDbVoucher);

    expect(voucherService.createVoucher(newVoucher.code, newVoucher.discount)).resolves.not.toThrow();
  })

  it("Código de cupom já existe", async () => {
    const newVoucher = voucherFactory.CreateVoucher(0);
    const expectedDbVoucher = voucherFactory.CreateDBVoucher(newVoucher.code, newVoucher.discount);

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(expectedDbVoucher);
    jest.spyOn(voucherRepository, "createVoucher")
      .mockResolvedValueOnce(expectedDbVoucher);

    expect(voucherService.createVoucher(newVoucher.code, newVoucher.discount)).rejects.toEqual({ type: "conflict", message: "Voucher already exist." });
  })
})
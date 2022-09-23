import voucherService from "../../src/services/voucherService"
import voucherRepository from "../../src/repositories/voucherRepository"
import * as voucherFactory from "../factories/voucherFactory"

describe("Criação de Voucher", () => {
  it("Desconto de 1% a 100% deve funcionar", async () => {
    const newVoucher = voucherFactory.CreateVoucher();
    const expectedDbVoucher = voucherFactory.CreateDBVoucher(newVoucher.code, newVoucher.discount);

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(null);
    jest.spyOn(voucherRepository, "createVoucher")
      .mockResolvedValueOnce(expectedDbVoucher);

    expect(voucherService.createVoucher(newVoucher.code, newVoucher.discount)).resolves.not.toThrow();
  })

  it("Código de cupom já existe", async () => {
    const newVoucher = voucherFactory.CreateVoucher();
    const expectedDbVoucher = voucherFactory.CreateDBVoucher(newVoucher.code, newVoucher.discount);

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(expectedDbVoucher);
    jest.spyOn(voucherRepository, "createVoucher")
      .mockResolvedValueOnce(expectedDbVoucher);

    expect(voucherService.createVoucher(newVoucher.code, newVoucher.discount)).rejects.toEqual({ type: "conflict", message: "Voucher already exist." });
  })
})

describe("Utilização do Voucher", () => {
  it("Voucher existe e não foi usado", async () => {
    const voucher = voucherFactory.CreateVoucher();
    const dbVoucher = voucherFactory.CreateDBVoucher(voucher.code, voucher.discount);
    const amount = voucherFactory.GetValidRandomAmount();

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(dbVoucher);
    jest.spyOn(voucherRepository, "useVoucher")
      .mockResolvedValueOnce({ ...dbVoucher, used: true });

    const result = await voucherService.applyVoucher(voucher.code, amount);
    const expectedResult = {
      amount,
      discount: voucher.discount,
      finalAmount: amount - (amount * voucher.discount / 100), applied: true
    }

    expect({
      ...result,
      finalAmount: Number(result.finalAmount.toFixed(2))
    }).toEqual({
      ...expectedResult,
      finalAmount: Number(expectedResult.finalAmount.toFixed(2))
    })
  });

  it("Voucher não existe", async () => {
    const voucher = voucherFactory.CreateVoucher();
    const amount = voucherFactory.GetValidRandomAmount();

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(null);

    expect(voucherService.applyVoucher(voucher.code, amount)).rejects.toEqual({
      type: "conflict",
      message: "Voucher does not exist."
    });
  })

  it("Voucher já foi usado", async () => {
    const voucher = voucherFactory.CreateVoucher();
    const dbVoucher = voucherFactory.CreateDBVoucher(voucher.code, voucher.discount, true);
    const amount = voucherFactory.GetValidRandomAmount();

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(dbVoucher);

    const result = await voucherService.applyVoucher(voucher.code, amount);
    const expectedResult = {
      amount,
      discount: voucher.discount,
      finalAmount: amount,
      applied: false
    }

    expect(result).toEqual(expectedResult);
  })

  it("Quantidade é menor que a válida", async () => {
    const voucher = voucherFactory.CreateVoucher();
    const dbVoucher = voucherFactory.CreateDBVoucher(voucher.code, voucher.discount, false);
    const amount = voucherFactory.GetInvalidRandomAmount();

    jest.spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(dbVoucher);

    const result = await voucherService.applyVoucher(voucher.code, amount);
    const expectedResult = {
      amount,
      discount: voucher.discount,
      finalAmount: amount,
      applied: false
    }

    expect(result).toEqual(expectedResult);
  })
})

import { faker } from "@faker-js/faker"
import { Voucher } from "@prisma/client"

export function CreateVoucher(discount: number | undefined) {
  const dbDiscount: number = discount !== undefined ? discount : faker.datatype.number({ min: 1, max: 100 })

  return {
    code: faker.random.alphaNumeric(16),
    discount: dbDiscount,
  }
}

export function CreateDBVoucher(code: string, discount: number, used = false): Voucher {
  return {
    id: faker.datatype.number({ min: 1 }),
    code,
    discount,
    used,
  }
}
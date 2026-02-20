class LicensePlate {
  private plateNumber: string;
  private registrationDate: Date;
  private expirationDate: Date;

  constructor(
    plateNumber: string,
    registrationDate: Date,
    expirationDate: Date,
  ) {
    this.plateNumber = plateNumber;
    this.registrationDate = registrationDate;
    this.expirationDate = expirationDate;
  }

  public getPlateNumber(): string {
    return this.plateNumber;
  }

  public getRegistrationDate(): Date {
    return this.registrationDate;
  }

  public getExpirationDate(): Date {
    return this.expirationDate;
  }

  public isValid(): boolean {
    const today = new Date();
    const current = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const reg = new Date(
      this.registrationDate.getFullYear(),
      this.registrationDate.getMonth(),
      this.registrationDate.getDate(),
    );

    const exp = new Date(
      this.expirationDate.getFullYear(),
      this.expirationDate.getMonth(),
      this.expirationDate.getDate(),
    );

    return current >= reg && current <= exp;
  }

  public displayPlateInfo(): string {
    return `LICENSE PLATE INFORMATION:
      Plate Number     : ${this.plateNumber}
      Registration Date: ${this.registrationDate.toDateString()}
      Expiration Date  : ${this.expirationDate.toDateString()}
      Status           : ${this.isValid() ? "VALID (Current & Not Expired)" : "EXPIRED or Not Current"}
    `;
  }
}

class Car {
  private manufacturer: string;
  private model: string;
  private yearOfManufacture: number;
  private ownerInfo: string;
  private licensePlate: LicensePlate;

  constructor(
    manufacturer: string,
    model: string,
    yearOfManufacture: number,
    ownerInfo: string,
    licensePlate: LicensePlate,
  ) {
    this.manufacturer = manufacturer;
    this.model = model;
    this.yearOfManufacture = yearOfManufacture;
    this.ownerInfo = ownerInfo;
    this.licensePlate = licensePlate;
  }

  public getManufacturer(): string {
    return this.manufacturer;
  }
  public getModel(): string {
    return this.model;
  }
  public getYearOfManufacture(): number {
    return this.yearOfManufacture;
  }
  public getOwnerInfo(): string {
    return this.ownerInfo;
  }
  public getLicensePlate(): LicensePlate {
    return this.licensePlate;
  }

  public calculateAge(): number {
    const currentYear: number = new Date().getFullYear();
    return currentYear - this.yearOfManufacture;
  }

  public qualifiesForRegistrationRenewal(): boolean {
    return this.calculateAge() <= 20 && this.licensePlate.isValid();
  }

  public displayCarDetails(): string {
    return `CAR DETAILS:
      Manufacturer       : ${this.manufacturer}
      Model              : ${this.model}
      Year of Manufacture: ${this.yearOfManufacture}
      Owner Information  : ${this.ownerInfo}
      Age                : ${this.calculateAge()} years
      Qualifies for Renewal: ${this.qualifiesForRegistrationRenewal() ? "YES" : "NO"}
      ASSOCIATED LICENSE PLATE (1-1 Association): ${this.licensePlate.displayPlateInfo()}
    `;
  }
}

const main = (): void => {
  const licensePlate1 = new LicensePlate(
    "SL 593 LM",
    new Date("2024-02-15"),
    new Date("2027-02-15"),
  );

  const teslaCar = new Car(
    "Tesla",
    "Model 3",
    2023,
    "Minhaj, Dhaka",
    licensePlate1,
  );

  console.log("TESLA CAR", teslaCar.displayCarDetails());

  const expiredPlate = new LicensePlate(
    "SL 999 EX",
    new Date("2020-01-01"),
    new Date("2022-01-01"),
  );

  const oldCar = new Car("Toyota", "Corolla", 2010, "John Doe", expiredPlate);

  console.log("TOYOTA CAR", oldCar.displayCarDetails());
};

main();

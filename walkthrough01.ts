enum Subject {
  PHYSICS,
  CHEMISTRY,
  BIOLOGY,
}

interface IMarks {
  [key: string]: number;
}

class Student {
  private studentId: number;
  private name: string;
  private marks: IMarks;

  constructor(studentId: number, name: string, marks: IMarks) {
    this.name = name;
    this.studentId = studentId;
    this.marks = { ...marks };
  }

  getName(): string {
    return this.name;
  }

  getStudentId(): number {
    return this.studentId;
  }

  getMarks(): IMarks {
    return { ...this.marks };
  }

  setMarks(marks: IMarks): void {
    this.marks = { ...marks };
  }

  setName(name: string): void {
    this.name = name;
  }
}

class StudentService {
  private listOfStudents: Student[] = [];
  addStudent(student: Student): void {
    this.listOfStudents.push(student);
  }
  updateStudent(id: number, name?: string, marks?: IMarks): void {
    const student = this.listOfStudents.find((s) => s.getStudentId() === id);

    if (!student) {
      throw new Error("Student not found");
    }

    if (name) student.setName(name);
    if (marks) student.setMarks({ ...marks });
  }

  removeStudent(id: number): void {
    this.listOfStudents = this.listOfStudents.filter(
      (s) => s.getStudentId() !== id,
    );
  }

  getStudent(id: number): Student | null {
    return this.listOfStudents?.find((s) => s.getStudentId() === id) || null;
  }

  getStudents(): Student[] {
    return this.listOfStudents;
  }
}

enum ResultStatus {
  PASSED = "passed",
  FAILED = "failed",
}

class Result {
  constructor(
    public studentName: string,
    public average: number,
    public status: ResultStatus,
  ) {}
}

interface ValidationErrorType {
  student: Student;
  error: string[];
}

class ResultService {
  private static MAX_MARK: number = 100;
  private static PASS_MARK: number = 50;

  private students: Student[] = [];

  constructor(students: Student[]) {
    this.students = students || [];
  }

  generateResults(): { valid: Result[]; invalid: ValidationErrorType[] } {
    const valid: Result[] = [];
    const invalid: ValidationErrorType[] = [];

    this.students.forEach((student) => {
      const validation = this.validateMarks(student.getMarks());
      if (validation.valid) {
        valid.push(this.calculateResult(student));
      } else {
        invalid.push({ student, error: validation.errors });
      }
    });

    return { valid, invalid };
  }

  private calculateResult(student: Student): Result {
    const values = Object.values(student.getMarks());

    const avg = values?.reduce((sum, val) => sum + val, 0) / values.length || 0;

    const average = Math.round(avg * 100) / 100;

    const status =
      average > ResultService.PASS_MARK
        ? ResultStatus.PASSED
        : ResultStatus.FAILED;

    return new Result(student.getName(), average, status);
  }

  private validateMarks(marks: IMarks): { valid: boolean; errors: string[] } {
    const subjects = Object.keys(Subject).filter((key) => isNaN(Number(key)));
    let errors: string[] = [];

    if (Object.keys(marks).length !== subjects.length) {
      errors.push("All subjects must be provided.");
    }

    for (const subject of subjects) {
      if (!(subject in marks)) {
        errors.push(`Missing mark for ${subject}.`);
      }
    }

    Object.entries(marks).forEach(([subject, mark]) => {
      if (mark < 0 || mark > ResultService.MAX_MARK) {
        errors.push(`Mark for ${subject} must be between 0 and 100. `);
      }
      if (!Number.isInteger(mark)) {
        errors.push(`Mark for ${subject} must be an integer.`);
      }
    });

    if (errors?.length > 0) {
      return { valid: false, errors: errors };
    }

    return { valid: true, errors: [] };
  }
}

const student1 = new Student(1, "Jahid", {
  [Subject.PHYSICS]: 70,
  [Subject.CHEMISTRY]: 80,
  [Subject.BIOLOGY]: 90,
});

const student2 = new Student(2, "Jakir", {
  [Subject.PHYSICS]: 60,
  [Subject.CHEMISTRY]: 70,
  [Subject.BIOLOGY]: 49,
});

const student3 = new Student(3, "Jovan", {
  [Subject.PHYSICS]: 70,
  [Subject.CHEMISTRY]: 105,
});

const studentService = new StudentService();

studentService.addStudent(student1);
studentService.addStudent(student2);
studentService.addStudent(student3);

const resultService = new ResultService(studentService.getStudents());
console.log("ResultService is", resultService);

const results = resultService.generateResults();

results.valid.forEach((r) => {
  console.log(`${r.studentName} | ${r.average} | ${r.status}`);
});

if (results.invalid.length > 0) {
  console.log("Warnings for invalid students:");
  results.invalid.forEach((inv) => {
    console.log(
      `Student ${inv.student.getName()} (ID: ${inv.student.getStudentId()}): ${inv.error.join(" ")}`,
    );
  });
}

import express, { Request, Response } from 'express';
import studentsDal from './students_dal';

const router = express.Router();

// --- /api/students
router.get('', async (req: Request, res: Response) => {
  try {
    const result = await studentsDal.get_all_students();
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching students" });
  }
});

// --- /api/students/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id); // Assume IDs are numeric
  try {
    const result = await studentsDal.get_student_by_id(id);
    res.status(200).json(result.data ? result.data : {});
  } catch (error) {
    res.status(500).json({ error: "Error fetching the student" });
  }
});

router.post('', async (req: Request, res: Response) => {
  const newStudent = req.body;
  try {
    const result = await studentsDal.insert_student(newStudent);
    if (result.status === "success") {
      res.status(201).json({ newStudent: result.data, url: `/api/students/${result.data.id}` });
    } else {
      res.status(result.internal ? 500 : 400).json({ status: "Failed to insert new student", error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: "Error inserting the student" });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updatedStudent = req.body;
  try {
    const result = await studentsDal.update_student(id, updatedStudent);
    res.status(200).json({ result: result.data ? "student updated" : "student not found" });
  } catch (error) {
    res.status(500).json({ error: "Error updating the student" });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updatedStudent = req.body;
  try {
    const result = await studentsDal.patch_student(id, updatedStudent);
    res.status(200).json({ result: result.data ? "student updated" : "student not found" });
  } catch (error) {
    res.status(500).json({ error: "Error patching the student" });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const result = await studentsDal.delete_student(id);
    res.status(200).json({ result: result.data ? "student deleted" : "student not found" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting the student" });
  }
});

router.delete('/students-delete-table', async (req: Request, res: Response) => {
  try {
    const result = await studentsDal.delete_table();
    res.status(200).json({ status: "table-deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting the table" });
  }
});

router.post('/students-create-table', async (req: Request, res: Response) => {
  try {
    const result = await studentsDal.create_table();
    if (result.status === "success") {
      res.status(201).json({ status: "table-created" });
    } else {
      res.status(result.internal ? 500 : 400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: "Error creating the table" });
  }
});

// router.post('/students-create6', async (req: Request, res: Response) => {
//   try {
//     const result = await studentsDal.insert_students6();
//     res.status(201).json({ result: "6 new students created" });
//   } catch (error) {
//     res.status(500).json({ error: "Error creating the students" });
//   }
// });

export default router;
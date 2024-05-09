import knex from 'knex';
import config from 'config';

interface Student {
    id?: number;
    name: string;
    age?: number;
    email: string;
    city?: string;
}

interface QueryResult {
    status: string;
    data?: any;
    internal?: boolean;
    error?: string;
}

const database = knex({
    client: 'pg',
    connection: {
        host: config.get('db_connection.host'),
        user: config.get('db_connection.user'),
        password: config.get('db_connection.password'),
        database: config.get('db_connection.database')
    }
});

export async function create_table(): Promise<QueryResult> {
    try {
        await database.raw(`CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            age INT,
            email VARCHAR(255) NOT NULL,
            city VARCHAR(255),
            UNIQUE(name),
            UNIQUE(email)
        );`);
        console.log('Create finished successfully');
        return { status: 'success' };
    } catch (e: any) {
        console.error('Create failed', e.message);
        return { status: 'error', internal: true, error: e.message };
    }
}

// export async function insert_students5(): Promise<QueryResult> {
//     const queries = `
//         INSERT INTO students (name, age, email, city) VALUES ('Arya Stark', 18, 'arya.stark@example.com', 'Winterfell');
//         INSERT INTO students (name, age, email, city) VALUES ('Jon Snow', 20, 'jon.snow@example.com', 'The Wall');
//         INSERT INTO students (name, age, email, city) VALUES ('Daenerys Targaryen', 22, 'daenerys.targaryen@example.com', 'Dragonstone');
//         INSERT INTO students (name, age, email, city) VALUES ('Tyrion Lannister', 24, 'tyrion.lannister@example.com', 'King’s Landing');
//         INSERT INTO students (name, age, email, city) VALUES ('Sansa Stark', 19, 'sansa.stark@example.com', 'Winterfell');`
//         .replaceAll('\n    ', '')
//         .split(';')
//         .filter(query => query);

//     try {
//         for (const query of queries) {
//             if (query) {
//                 await database.raw(query + ';');
//             }
//         }
//         return { status: 'success' };
//     } catch (e: any) {
//         console.error('Insert 5 failed', e.message);
//         return { status: 'error', internal: true, error: e.message };
//     }
// }

export async function get_all_students(): Promise<QueryResult> {
    try {
        const students = await database.raw("SELECT * FROM students");
        return { status: 'success', data: students.rows };
    } catch (e: any) {
        console.error('Error fetching all students', e.message);
        return { status: 'error', internal: true, error: e.message };
    }
}

export async function get_student_by_id(id: number): Promise<QueryResult> {
    try {
        const students = await database.raw(`SELECT * FROM students WHERE id = ?`, [id]);
        return { status: 'success', data: students.rows[0] };
    } catch (e: any) {
        console.error('Error fetching student by id', e.message);
        return { status: 'error', internal: true, error: e.message };
    }
}

export async function insert_student(new_student: Student): Promise<QueryResult> {
    try {
        delete new_student.id;
        const resultIds = await database('students').insert(new_student).returning('id');
        const id = resultIds[0].id;
        return { status: 'success', data: { id, ...new_student } };
    } catch (e: any) {
        console.error('Insert failed', e.message);
        return { status: 'error', internal: false, error: e.message.replaceAll('"', "'") };
    }
}

export async function update_student(id: number, updated_student: Student): Promise<QueryResult> {
    try {
        const result = await database.raw(
            `UPDATE students SET name=?, age=?, email=?, city=? WHERE id=?`,
            [updated_student.name || '', updated_student.age || 0, updated_student.email || '', updated_student.city || '', id]
        );
        return { status: 'success', data: result.rowCount };
    } catch (e: any) {
        console.error('Update failed', e.message);
        return { status: 'error', internal: true, error: e.message };
    }
}

export async function patch_student(id: number, updated_student: Partial<Student>): Promise<QueryResult> {
    const queryArr = Object.entries(updated_student).map(([key, value]) => `${key}='${value}'`);
    if (queryArr.length === 0) return { status: 'success', data: queryArr.length };

    try {
        const query = `UPDATE students SET ${queryArr.join(', ')} WHERE id=${id}`;
        const result = await database.raw(query);
        return { status: 'success', data: result.rowCount };
    } catch (e: any) {
        console.error('Patch failed', e.message);
        return { status: 'error', internal: true, error: e.message };
    }
}

export async function delete_student(id: number): Promise<QueryResult> {
    try {
        const result = await database.raw(`DELETE FROM students WHERE id=?`, [id]);
        return { status: 'success', data: result.rowCount };
    } catch (e: any) {
        console.error('Delete failed', e.message);
        return { status: 'error', internal: true, error: e.message };
    }
}

export async function delete_table(): Promise<QueryResult> {
    try {
        await database.raw(`DROP TABLE IF EXISTS students`);
        return { status: 'success' };
    } catch (e: any) {
        console.error('Delete table failed', e.message);
        return { status: 'error', internal: true, error: e.message };
    }
}

export default {
    get_all_students, get_student_by_id, insert_student,
    update_student, patch_student, delete_student, delete_table,
    create_table
}
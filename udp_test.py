from app import fetch_student_marks 

if __name__ == '__main__':
    students = fetch_student_marks()
    for s in students:
        print(f'{s["name"]}: {s["mark"]}')

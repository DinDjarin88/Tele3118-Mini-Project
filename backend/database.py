_db = []

def populate(new_students):
    global _db
    _db = list(new_students)

def get_all():
    return list(_db)

def get_student(name):
    for student in _db:
        if student['name'] == name:
            return student
    return None

def add_student(name, mark):
    student = get_student(name)
    if student:
        student['mark'] = mark
    else:
        _db.append({'name': name, 'mark': mark})

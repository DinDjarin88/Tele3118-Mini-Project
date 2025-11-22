import socket

# for C compatible structs
import struct

PORT = 5000
#'149.171.37.163
SERVER_IP = '149.171.37.163'

# 127.0.0.1


# Needs to be written as a tuple
SERVER_ADDRESS = (SERVER_IP, PORT)


# C compatible request string sent as binary with null terminating operator 
# at the end, EXACTLY 16 BYTES LONG
REQUEST_STRING = b'studentmarklist\00'


def fetch_student_marks():
    
    # Created a new socket using the socket function in python, 
    # AF_INET specifies ipv4, SOCK_DGRAM specifies UDP type
    
    print('1. Creating a Socket')
    sock = socket.socket(socket.AF_INET, socket)
    
    # print('1. ')
    sock.settimeout(2.0)
    

    #Sends the request via the socket 
    sock.sendto(REQUEST_STRING, SERVER_ADDRESS)

    # recvfrom() method set up UDP socket packets, each packet
    # contains the senders address and device information 
    # Max bytes to be received set as 4096 , waiting for and sending the response

    print('2. Getting response from UDP server')

    data, _ = sock.recvfrom(4096)
 
    # Find the number of students in the response (first four bytes)
    n_students_bytes =  data[:4] #struct.unpack('!I', data[:4])[0]
    n_students = int(n_students_bytes)

    # Gets everything except the first four t
    just_students = data[4:]

    students = []

    i = 0

    print('3. Parsing through the data response')

    print(data, 'THIS IS THE DATA -------->>>>>>')

    for i in range(n_students):
        
        # get each name with corresponding data by parsing the data
        student = just_students[(20 * i):(20 + 20 * i)]

        name = student.split(b'\x00', 1)[0]

        # Convert the bytes to text
        name = name.decode('utf-8')

        # parse to get mark
        mark = int(student[16:20])

        students.append({'name': name, 'mark': mark})


    print('4. Data added to database: \n', students)
    
    return students






fetch_student_marks()
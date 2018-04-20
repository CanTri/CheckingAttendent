import face_recognition
import cv2
import copy

class Face:
    def __init__(self,person,file):
        image = face_recognition.load_image_file(file)
        self.encoding = face_recognition.face_encodings(image)[0]
        self.person = person
        self.file = file
def nothing(x):
    pass
#obama_image = face_recognition.load_image_file("obama.jpg")
#obama_face_encoding = face_recognition.face_encodings(obama_image)[0]
#a = Face("Obama","obama.jpg")

#hiep_image = face_recognition.load_image_file("TungHiep.jpg")
#hiep_face_encoding = face_recognition.face_encodings(hiep_image)[0]
#b = Face("Hiep","TungHiep.jpg")



# Initialize some variables
face_locations = []
face_encodings = []
check_face_encodings =[]
face_names = []
process_this_frame = True



check_face_encodings.append(Face("Obama","obama.jpg"))
check_face_encodings.append(Face("Hiep","TungHiep.jpg"))
check_face_encodings.append(Face("America","chris.jpg"))
check_face_encodings.append(Face("Hawk","hawk.jpg"))
check_face_encodings.append(Face("Hulk","hulk.jpg"))
check_face_encodings.append(Face("Iron","iron.jpg"))
check_face_encodings.append(Face("Widow","widow.jpg"))
check_face_encodings.append(Face("Tam","Tam.jpg"))
check_face_encodings.append(Face("Khoi","Khoi.jpg"))
check_face_encodings.append(Face("Tri","Tri.jpg"))







# Grab a single frame of video
frame = cv2.imread(raw_input("Input file name: "))

if frame is None:
    webcam = cv2.VideoCapture(0)
    while True:
        s, frame = webcam.read()
        cv2.imshow('Video', frame)
        if cv2.waitKey(1) != -1:
            #cv2.imwrite("testing.jpg",frame)
            break

myimage = copy.deepcopy(frame)
cv2.namedWindow("Video",cv2.WINDOW_NORMAL)
cv2.createTrackbar("Correctness", "Video", 0, 9,nothing)
cv2.createTrackbar("Small Face", "Video", 0, 5,nothing)
temp = -1
temp2 = -1
while True:
    value = (cv2.getTrackbarPos("Correctness", "Video"))/10.0
    if (value == 0):
        value = 0.1
    face_value = cv2.getTrackbarPos("Small Face", "Video")
    if (face_value == 0):
        face_value = 1
    if ((value != temp and value > 0) or (face_value != temp2 and face_value > 0)):
        frame = copy.deepcopy(myimage)
        # Resize frame of video to 1/4 size for faster face recognition processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        face_locations = face_recognition.face_locations(small_frame,face_value)
        print "Face detected at location: " + str(face_locations)
        face_encodings = face_recognition.face_encodings(small_frame, face_locations)
        face_names = []
        for face_encoding in face_encodings:
            print ("------Checking------")
            name = "Unknown"
            for i in range(len(check_face_encodings)):
                match = face_recognition.compare_faces([check_face_encodings[i].encoding], face_encoding,value)
                if match[0]:
                    name = check_face_encodings[i].person
                print "Checking with " + check_face_encodings[i].person + " Result: " + str(match)
            face_names.append(name)
        # Display the results
        for (top, right, bottom, left), name in zip(face_locations, face_names):
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
        temp = value
        temp2 = face_value
        cv2.imshow("Video", frame)
    if cv2.waitKey(1) == 27: # press ESC to close window
        cv2.destroyAllWindows()
        break
        
        

cv2.waitKey(0)
# Release handle to the webcam
cv2.destroyAllWindows()


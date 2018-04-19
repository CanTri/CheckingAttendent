//
//  CheckAttendanceViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/11/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class CheckAttendanceViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {

    var course: Course?
    var students = [Student]()
    var presentOrAbsentStudents = [Student]()
    let token = UserDefaults.standard.string(forKey: "token")
    var studentImage = UIImage()
    let dispatchGroup = DispatchGroup()
    
    
    @IBOutlet weak var StatusSegmentedControl: UISegmentedControl!
    
    @IBAction func indexChanged(_ sender: Any) {
//        switch StatusSegmentedControl.selectedSegmentIndex {
//        case 0:
//            break
//
//        case 1:
//            break
//        default:
//            break
//        }
        self.GetStudentTask()
    }
    @IBOutlet weak var StudenListTableView: UITableView!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let reloadButton = UIBarButtonItem(title: "Reload", style: .done, target: self, action: #selector(ReloadButtonTapped))
        self.navigationItem.rightBarButtonItem = reloadButton
        
        GetStudentTask()

        // Do any additional setup after loading the view.
        StudenListTableView.delegate = self
        StudenListTableView.dataSource = self
    }
    
    @objc func ReloadButtonTapped(){
        self.GetStudentTask()
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.presentOrAbsentStudents.count
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 100
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = self.StudenListTableView.dequeueReusableCell(withIdentifier: "CheckListCell") as! CheckListTableViewCell
        
        self.dispatchGroup.enter()
        cell.CheckListView.layer.cornerRadius = cell.CheckListView.frame.height/2
        self.UpdateAvartarImage(url: self.students[indexPath.row].avatar)
        dispatchGroup.wait(timeout: DispatchTime.now() + 2)
        cell.AvatarImageView.image = self.studentImage
        cell.AvatarImageView.layer.cornerRadius = cell.AvatarImageView.frame.height/2

        cell.NameStudentLabel.text = self.presentOrAbsentStudents[indexPath.row].name
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        CheckPresentOrAbsentStudent(student_id: self.presentOrAbsentStudents[indexPath.row].id)
        self.presentOrAbsentStudents.remove(at: indexPath.row)
        self.StudenListTableView.reloadData()
        //print (presentOrAbsentStudents)
    }
    
    
    func GetStudentTask(){
        students.removeAll()
        presentOrAbsentStudents.removeAll()
        
        let myUrl = NSURL(string:UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/check-attendance");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": self.token!, "attendance_id": course?.attendance_id ] as [String : Any]
        
        do{
            request.httpBody = try JSONSerialization.data(withJSONObject: postString, options: .prettyPrinted)
        } catch let error{
            print(error.localizedDescription)
            return
        }
        
        
        let task = URLSession.shared.dataTask(with: request as URLRequest){
            (data: Data?, response: URLResponse?, error: Error?) in
            if error != nil{
                print("error=\(error)")
                return
            }
            do {
                let json = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? NSDictionary
                if let parseJSON = json {
                    let resultValue = parseJSON["result"] as? String
                    
                    
                    print("result: \(resultValue)")
                    if (resultValue == "success"){
                        let studentlist = parseJSON["check_attendance_list"] as? [[String:Any]]
                        for temp in studentlist!{
                            let id = temp["id"] as? Int
                            let code = temp["code"] as? String
                            let name = temp["name"] as? String
                            let status = temp["status"] as? Int
                            let avatar = temp["avatar"] as? String
                            let answered_questions = temp["answered_questions"] as? String
                            let discussions = temp["discussions"] as? String
                            let presentations = temp["presentations"] as? String
                            
                            let student = Student(id: id!, code: code!, name: name!, status: status!, avatar: avatar!, answered_questions: answered_questions, discussions: discussions, presentations: presentations)
                            self.students.append(student)
                        }
                        DispatchQueue.main.async { // Correct
                            if self.StatusSegmentedControl.selectedSegmentIndex == 1 {
                                    self.UpdatePresentStudent()
                            }
                            else{
                                self.UpdateAbsentStudent()
                            }
                        }

                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
        
    }
    
    func CheckPresentOrAbsentStudent(student_id: Int){
        let myUrl = NSURL(string:UserDefaults.standard.string(forKey: "HOST")! + "api/check-attendance/check-list");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        var postString = ["token": self.token!,"student_id": student_id ,"attendance_id": course?.attendance_id, "attendance_type": 1] as [String : Any] //present
        if self.StatusSegmentedControl.selectedSegmentIndex == 1 {
            postString = ["token": self.token!,"student_id": student_id ,"attendance_id": course?.attendance_id, "attendance_type": 0] as [String : Any] //absent
        }
        
        do{
            request.httpBody = try JSONSerialization.data(withJSONObject: postString, options: .prettyPrinted)
        } catch let error{
            print(error.localizedDescription)
            return
        }
        
        
        let task = URLSession.shared.dataTask(with: request as URLRequest){
            (data: Data?, response: URLResponse?, error: Error?) in
            if error != nil{
                print("error=\(error)")
                return
            }
            do {
                let json = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? NSDictionary
                if let parseJSON = json {
                    let resultValue = parseJSON["result"] as? String
                    
                    
                    print("result_CheckPresentOrAbsentStudent: \(resultValue)")
                    if (resultValue == "success"){
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    
    func UpdateAvartarImage(url: String) {
        let URL_IMAGE = URL(string: url )
        
        let session = URLSession(configuration: .default)
        
        //creating a dataTask
        let getImageFromUrl = session.dataTask(with: URL_IMAGE!) { (data, response, error) in
            
            //if there is any error
            if let e = error {
                //displaying the message
                print("Error Occurred: \(e)")
                
            } else {
                //in case of now error, checking wheather the response is nil or not
                if (response as? HTTPURLResponse) != nil {
                    
                    //checking if the response contains an image
                    if let imageData = data {
                        
                        //getting the image
                        self.studentImage = UIImage(data: imageData)!
                        self.dispatchGroup.leave()
                        
                        
                    } else {
                        print("Image file is currupted")
                    }
                } else {
                    print("No response from server")
                }
            }
        }
        
        //starting the download task
        getImageFromUrl.resume()
    }
    
    func UpdatePresentStudent(){
        self.presentOrAbsentStudents.removeAll()
        for student in students{
            if student.status == 1{
                presentOrAbsentStudents.append(student)
                
            }
        }
        self.StudenListTableView.reloadData()
    }
    
    func UpdateAbsentStudent(){
        self.presentOrAbsentStudents.removeAll()
        for student in students{
            if student.status == 0{
                presentOrAbsentStudents.append(student)
                
            }
        }
        self.StudenListTableView.reloadData()
    }
    
    

    

}

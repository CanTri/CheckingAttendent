//
//  AbsentStudentViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/11/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class AbsentStudentViewController: UIViewController, UITableViewDelegate, UITableViewDataSource  {
    
    var course: Course?
    var students = [Student]()
    var absentStudents = [Student]()
    let token = UserDefaults.standard.string(forKey: "token")

    @IBAction func AbsentBtnTapped(_ sender: UIButton) {
        GetStudentTask()
    }
    @IBOutlet weak var AbsentStudentTableView: UITableView!
    
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        GetStudentTask()
        
        // Do any additional setup after loading the view.
        AbsentStudentTableView.delegate = self
        AbsentStudentTableView.dataSource = self
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.absentStudents.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
        cell.textLabel?.text = self.absentStudents[indexPath.row].name.capitalized
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        CheckAbsentStudent(student_id: self.absentStudents[indexPath.row].id)
        self.absentStudents.remove(at: indexPath.row)
        self.AbsentStudentTableView.reloadData()
        print (absentStudents)
    }
    
    
    func GetStudentTask(){
        students.removeAll()
        absentStudents.removeAll()
        
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
                        
                        self.UpdateAbsentStudent()
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
        
    }
    
    func CheckAbsentStudent(student_id: Int){
        let myUrl = NSURL(string:UserDefaults.standard.string(forKey: "HOST")! + "api/check-attendance/check-list");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": self.token!,"student_id": student_id ,"attendance_id": course?.attendance_id, "attendance_type": 1] as [String : Any]
        
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
                    
                    
                    print("result_CheckAbsentStudent: \(resultValue)")
                    if (resultValue == "success"){
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    
    func UpdateAbsentStudent(){
        for student in students{
            if student.status == 0{
                absentStudents.append(student)
                
            }
        }
        self.AbsentStudentTableView.reloadData()
    }

    

}

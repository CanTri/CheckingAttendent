//
//  OpenningCourseDetailViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/19/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class OpenningCourseDetailViewController: UIViewController {
    
    var course: Course?
    var students = [Student]()
    var numberOfPresentStudent: Int = 0
    var numberOfAbsentStudent: Int = 0
    var token = UserDefaults.standard.string(forKey: "token")
    
    @IBOutlet weak var TotalStudentLabel: UILabel!
    @IBOutlet weak var PresentStudentLabel: UILabel!
    @IBOutlet weak var AbsentStudentLabel: UILabel!
    @IBAction func DelegateCodeButtonTapped(_ sender: UIButton) {
        DelegateCodeTask()
    }
    
    @IBAction func StatisticButtonTapped(_ sender: UIButton) {
        self.GetStudentTask()
    }
    @IBAction func FinishButtonTapped(_ sender: UIButton) {
        self.FinishAttendanceTask()
    }
    @IBAction func CancelButtonTapped(_ sender: UIButton) {
        let alert = UIAlertController(title: "Confirmation", message: "Are you sure you want to delete this attendance?", preferredStyle: .alert)
        
        alert.addAction(UIAlertAction(title: "Agree", style: .default, handler: {action in
            self.CancelAttendanceTask()
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        self.present(alert, animated: true)
        
    }
    @IBAction func bookAttendaceButtonTapped(_ sender: UIButton) {
        self.performSegue(withIdentifier: "showBookAttendanceView", sender: self)
    }
    @IBAction func QRCodeButtonTapped(_ sender: UIButton) {
        self.performSegue(withIdentifier: "showQRCode", sender: self)
    }
    @IBAction func CheckListButtonTapped(_ sender: UIButton) {
        self.performSegue(withIdentifier: "showCheckListView", sender: self)
    }
    @IBAction func FaceRecognitionBtnTapped(_ sender: UIButton) {
        self.performSegue(withIdentifier: "showFaceRecognitionView", sender: self)
    }
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if let destination = segue.destination as? CheckAttendanceViewController{
            destination.course = self.course
        }
        else if let destination = segue.destination as? QRCodeViewController{
            destination.attendanceID = self.course?.attendance_id
        }
        
        else if let destination = segue.destination as? FaceRecognitionViewController{
            destination.course = self.course
        }
    }
    override func viewDidLoad() {
        super.viewDidLoad()

        //GetStudentTask()
        // Do any additional setup after loading the view.
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated) // No need for semicolon
        self.token = UserDefaults.standard.string(forKey: "token")
        
        GetStudentTask()
    }

    func GetStudentTask(){
        students.removeAll()
        numberOfAbsentStudent=0
        numberOfPresentStudent=0
        
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
                            
                            //number of present, absent
                            if status == 0{
                                self.numberOfAbsentStudent += 1
                            }
                            else{
                                self.numberOfPresentStudent += 1
                            }
                        }
                        DispatchQueue.main.async { // Correct
                            self.TotalStudentLabel.text =  String(self.students.count)
                            self.AbsentStudentLabel.text = String(self.numberOfAbsentStudent)
                            self.PresentStudentLabel.text =  String(self.numberOfPresentStudent)
                        }
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
        
    }
    
    func FinishAttendanceTask (){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/close");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token, "attendance_id": course?.attendance_id] as? [String: Any]
        
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
                    print("result_FinishAttendanceTask: \(resultValue)")
                    if (resultValue == "success"){
                        let alert = UIAlertController(title: "Success", message: "Finish attendance!", preferredStyle: .alert)
                        alert.addAction(UIAlertAction(title: "Close", style: .default, handler: {action in
                            _ = self.navigationController?.popViewController(animated: true)
                        }))
                        self.present(alert, animated: true)
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    func CancelAttendanceTask (){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/delete");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token, "attendance_id": course?.attendance_id] as? [String: Any]
        
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
                    print("result_CancelAttendanceTask \(resultValue)")
                    if (resultValue == "success"){
                        let alert = UIAlertController(title: "Success", message: "Finish delete!", preferredStyle: .alert)
                        alert.addAction(UIAlertAction(title: "Close", style: .default, handler: {action in
                            _ = self.navigationController?.popViewController(animated: true)
                        }))
                        self.present(alert, animated: true)
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    
    func DelegateCodeTask(){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/generate-delegate-code");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": self.token, "class_id": self.course?.class, "course_id": self.course?.id] as? [String: Any]
        
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
                    print("result_SubmitQuizCodeTask: \(resultValue)")
                    if (resultValue == "success"){
                        DispatchQueue.main.async {
                            let code = parseJSON["code"] as? String
                            let alert = UIAlertController(title: "Delegated Code", message: code, preferredStyle: .alert)
                            alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                            
                            self.present(alert, animated: true)
                        }
                        
                    }
                    else{
                        var nmessage = parseJSON["message"] as! String
                        let alert = UIAlertController(title: "Error", message: nmessage, preferredStyle: .alert)
                        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
                        
                        self.present(alert, animated: true)
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }

    

}

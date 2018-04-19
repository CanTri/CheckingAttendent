//
//  AttendanceTableViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/25/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class AttendanceTableViewController: UITableViewController {
    
    var course = Course() // Course for checklist
    var quizCode = "" as String
    var token = UserDefaults.standard.string(forKey: "token")
    override func viewDidLoad() {
        super.viewDidLoad()

    }
    override func viewWillAppear(_ animated: Bool) {
        self.token = UserDefaults.standard.string(forKey: "token")
        let role_id = UserDefaults.standard.integer(forKey: "role_id")
        if role_id != 1 {
            let alert = UIAlertController(title: "Attention", message: "This function is used only by students!", preferredStyle: .alert)
            
            alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: {action in
                DispatchQueue.main.async { // Correct
                    self.tabBarController?.selectedIndex = 0
                }
            }))
            
            self.present(alert, animated: true)
            
        }
        
    }
    @IBAction func AbsenceRequestButtonTapped(_ sender: UIButton) {
        AbsenceRequestTask()
    }
    @IBAction func QRCodeButtonTapped(_ sender: UIButton) {
        self.performSegue(withIdentifier: "scanQRCodeView", sender: self)
    }
    
    @IBAction func CheckListButtonTapped(_ sender: UIButton) {
        CheckListTask()
    }
    
    @IBAction func QuizButtonTapped(_ sender: UIButton) {
        //self.performSegue(withIdentifier: "showQuizView", sender: self)
        QuizDelegateCodeTask()
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let a = indexPath.section
        let b = indexPath.row
        
        print (String(a) + " " + String(b))
        if a==0 && b == 0{
            
        }
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if let destination = segue.destination as? CheckAttendanceViewController{
            destination.course = self.course
        }
        else if let destination = segue.destination as? QuizViewController{
            destination.quizCode = self.quizCode
        }
    }
    
    func CheckListTask(){
        //get delegate code
        let alert = UIAlertController(title: "Delegate code", message: "Enter a code", preferredStyle: .alert)
        
        //2. Add the text field. You can configure it however you need.
        alert.addTextField { (textField) in
            textField.text = ""
        }
        
        // 3. Grab the value from the text field, and print it when the user clicks OK.
        alert.addAction(UIAlertAction(title: "Submit", style: .default, handler: { [weak alert] (_) in
            let textField = alert?.textFields![0]
            let code = textField?.text
            print("Code: \(code)")
            self.SubmitDelegateCodeTask(code: code!)
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        // 4. Present the alert.
        self.present(alert, animated: true, completion: nil)
    }
    
    func SubmitDelegateCodeTask(code: String){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/check-delegate-code");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token, "code": code] as? [String: Any]
        
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
                        let delegate_detail = parseJSON["delegate_detail"] as? NSDictionary
                        let attendance_id = delegate_detail!["attendance_id"] as? Int
                        self.course.attendance_id = attendance_id!
                        DispatchQueue.main.async {
                            self.performSegue(withIdentifier: "FromAttendaceToCheckList", sender: self)
                        }
                        
                        
                        
                    }
                    else{
                        let alert = UIAlertController(title: "Error", message: "Code not correct!", preferredStyle: .alert)
                        
                        alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                        
                        self.present(alert, animated: true)
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }

    func QuizDelegateCodeTask(){
        //1. Create the alert controller.
        let alert = UIAlertController(title: "Delegate Code", message: "", preferredStyle: .alert)
        
        //2. Add the text field. You can configure it however you need.
        alert.addTextField { (textField) in
            textField.text = ""
        }
        
        // 3. Grab the value from the text field, and print it when the user clicks OK.
        alert.addAction(UIAlertAction(title: "Submit", style: .default, handler: { [weak alert] (_) in
            let textField = alert?.textFields![0] // Force unwrapping because we know it exists.
            //print("Text field: \(textField.text)")
            self.quizCode = (textField?.text)!
            self.SubmitQuizCodeTask()
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        // 4. Present the alert.
        self.present(alert, animated: true, completion: nil)
    }
    
    func SubmitQuizCodeTask(){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/quiz/join");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": self.token, "code": self.quizCode] as? [String: Any]
        
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
                            self.performSegue(withIdentifier: "showQuizView", sender: self)
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
    
    func AbsenceRequestTask(){
        self.performSegue(withIdentifier: "showAbsenceRequestView", sender: self)
    }
}

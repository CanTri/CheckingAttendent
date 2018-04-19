//
//  AbsenceRequestViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 2/1/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class AbsenceRequestViewController: UIViewController {

    var token = UserDefaults.standard.string(forKey: "token")
    var id = UserDefaults.standard.string(forKey: "id")
    
    @IBOutlet weak var ReasonTextView: UITextView!
    @IBOutlet weak var FromDateTextField: UITextField!
    @IBOutlet weak var ToDateTextField: UITextField!
    
    let picker = UIDatePicker()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let sendButton = UIBarButtonItem(title: "Send", style: .done, target: self, action: #selector(SendButtonTapped))
        self.navigationItem.rightBarButtonItem = sendButton
        
        var borderColor : UIColor = UIColor(red: 0.85, green: 0.85, blue: 0.85, alpha: 1.0)
        self.ReasonTextView.layer.borderColor = borderColor.cgColor
        self.ReasonTextView.layer.borderWidth = 1.0
        self.ReasonTextView.layer.cornerRadius = 8

        // Do any additional setup after loading the view.
        createDatePicker1()
        createDatePicker2()
    }
    
    @objc func SendButtonTapped(){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/absence-request/create");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": self.token, "reason": self.ReasonTextView.text, "start_date": self.FromDateTextField.text, "end_date": self.ToDateTextField.text] as? [String: Any]
        
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
                            let alert = UIAlertController(title: "Confirmation", message: "Your absence request has been sent!", preferredStyle: .alert)
                            
                            alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: {action in
                                _ = self.navigationController?.popViewController(animated: true)
                            }))
                            
                            
                            self.present(alert, animated: true)
                        }
                        
                    }
                    else{
                        DispatchQueue.main.async {
                            var nmessage = parseJSON["message"] as! String
                            let alert = UIAlertController(title: "Error", message: nmessage, preferredStyle: .alert)
                            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
                            
                            self.present(alert, animated: true)
                        }
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    
    func createDatePicker1(){
        
        let toolbar = UIToolbar()
        toolbar.sizeToFit()
        
        let done = UIBarButtonItem(barButtonSystemItem: .done, target: nil, action: #selector(donePressed1))
        toolbar.setItems([done], animated: false)
        
        FromDateTextField.inputAccessoryView = toolbar
        FromDateTextField.inputView = picker
        
        picker.datePickerMode = .date
    }
    
    @objc func donePressed1(){
        //format date
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        let dateString = formatter.string(from: picker.date)
        
        FromDateTextField.text = "\(dateString)"
        self.view.endEditing(true)
    }
    
    func createDatePicker2(){
        
        let toolbar = UIToolbar()
        toolbar.sizeToFit()
        
        let done = UIBarButtonItem(barButtonSystemItem: .done, target: nil, action: #selector(donePressed2))
        toolbar.setItems([done], animated: false)
        
        ToDateTextField.inputAccessoryView = toolbar
        ToDateTextField.inputView = picker
        
        picker.datePickerMode = .date
    }
    
    @objc func donePressed2(){
        //format date
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        let dateString = formatter.string(from: picker.date)
        
        ToDateTextField.text = "\(dateString)"
        self.view.endEditing(true)
    }

    

}

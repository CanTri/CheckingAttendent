//
//  ChangePasswordViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/23/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class ChangePasswordViewController: UIViewController {

    var token = UserDefaults.standard.string(forKey: "token")
    @IBOutlet weak var CurrentPassText: UITextField!
    @IBOutlet weak var NewPassText: UITextField!
    @IBOutlet weak var ConfirmPassText: UITextField!
    override func viewDidLoad() {
        super.viewDidLoad()

        let saveButton = UIBarButtonItem(title: "Save", style: .done, target: self, action: #selector(SaveButtonTapped))
        self.navigationItem.rightBarButtonItem = saveButton
        // Do any additional setup after loading the view.
    }
    
    override func viewWillAppear(_ animated: Bool) {
        self.token = UserDefaults.standard.string(forKey: "token")
        
    }
    
    @objc func SaveButtonTapped(){
        if ConfirmPassText.text != NewPassText.text{
            let alert = UIAlertController(title: "Failed", message: "Confirm password does not match!", preferredStyle: .alert)
            
            alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
            
            self.present(alert, animated: true)
        }
        else{
            UpdatePasswordTask()
        }
    }
    
    func UpdatePasswordTask(){
        let confirmpass = ConfirmPassText.text
        let currentpass = CurrentPassText.text
        let newpass = NewPassText.text
        
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/user/change-password");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token, "confirm_password": confirmpass, "current_password": currentpass, "new_password": newpass]
        
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
                        DispatchQueue.main.async { // Correct
                            let alert = UIAlertController(title: "Successful", message: "Your password has been changed !", preferredStyle: .alert)
                            
                            alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: {action in
                                _ = self.navigationController?.popViewController(animated: true)
                            }))
                            
                            self.present(alert, animated: true)
                        }
                        
                    }
                    else if (resultValue == "failure"){
                        let nmessage = parseJSON["message"] as? String
                        DispatchQueue.main.async { // Correct
                            let alert = UIAlertController(title: "Error", message: nmessage, preferredStyle: .alert)
                            
                            alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                            
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


}

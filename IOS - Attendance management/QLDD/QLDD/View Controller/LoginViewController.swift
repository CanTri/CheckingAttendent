//
//  LoginViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 12/25/17.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit
import Alamofire
import SwiftyJSON

class LoginViewController: UIViewController {

    @IBOutlet weak var SettingHostButton: UIButton!
    @IBOutlet weak var userEmailTextField: UITextField!
    @IBOutlet weak var userPasswordTextField: UITextField!
        
    var indicator = UIActivityIndicatorView()
    
    var orientationLock = UIInterfaceOrientationMask.all
    
    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        return self.orientationLock
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        //UserDefaults.standard.set("http://192.168.1.240:3000/", forKey: "HOST");
        //UserDefaults.standard.set("http://192.168.0.106:3000/", forKey: "HOST");
        UserDefaults.standard.set("https://hcmus-attendance.herokuapp.com/", forKey: "HOST");

        indicator.center = self.view.center
        indicator.activityIndicatorViewStyle = .gray
        indicator.transform = CGAffineTransform(scaleX: 1.5, y: 1.5);
        self.view.addSubview(indicator)

        // Do any additional setup after loading the view.
        let origImage = UIImage(named: "spanner")
        let tintedImage = origImage?.withRenderingMode(.alwaysTemplate)
        SettingHostButton.setImage(tintedImage, for: .normal)
        SettingHostButton.tintColor = UIColor.lightGray
    
        
    }
    @IBAction func SettingHostButtonTapped(_ sender: UIButton) {
        //1. Create the alert controller.
        let alert = UIAlertController(title: "Host", message: "Change host for api here", preferredStyle: .alert)
        
        //2. Add the text field. You can configure it however you need.
        alert.addTextField { (textField) in
            textField.text = UserDefaults.standard.string(forKey: "HOST")
            textField.clearButtonMode = UITextFieldViewMode.whileEditing
        }
        
        // 3. Grab the value from the text field, and print it when the user clicks OK.
        alert.addAction(UIAlertAction(title: "Save", style: .default, handler: { [weak alert] (_) in
            let textField = alert?.textFields![0] // Force unwrapping because we know it exists.
            UserDefaults.standard.set(textField?.text, forKey: "HOST");
            print("Host changed: \(textField?.text)")
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        // 4. Present the alert.
        self.present(alert, animated: true, completion: nil)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        if Reachability.isConnectedToNetwork(){
            print("Internet Connection Available!")
        }
        else{
            print("Internet Connection not Available!")
            DispatchQueue.main.async { // Correct
                let alert = UIAlertController(title: "Error", message: "Please check your internet connection!", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                
                self.present(alert, animated: true)
            }
        }
        let old_email = UserDefaults.standard.string(forKey: "email")
        userEmailTextField.text = old_email
        let isUserLoggedIn = UserDefaults.standard.bool(forKey: "isUserLoggedIn");
        if isUserLoggedIn{
            DispatchQueue.main.async { // Correct
                self.indicator.stopAnimating()
                self.performSegue(withIdentifier: "FromLoginToCoursesView", sender: self)
            }
        }
        
        
        
    }
    
    @IBAction func ForgetPasswordButtonTapped(_ sender: UIButton) {
        //1. Create the alert controller.
        let alert = UIAlertController(title: "Forget password?", message: "Submit your email address here", preferredStyle: .alert)
        
        //2. Add the text field. You can configure it however you need.
        alert.addTextField { (textField) in
            textField.text = ""
        }
        
        // 3. Grab the value from the text field, and print it when the user clicks OK.
        alert.addAction(UIAlertAction(title: "Request", style: .default, handler: { [weak alert] (_) in
            let textField = alert?.textFields![0] // Force unwrapping because we know it exists.
            self.ForgetPasswordTask(email: (textField?.text)!)
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        // 4. Present the alert.
        self.present(alert, animated: true, completion: nil)
        
    }
    @IBAction func loginButtonTapped(_ sender: Any) {
        let userEmail = userEmailTextField.text;
        let userPassword = userPasswordTextField.text
        self.indicator.startAnimating()
        
        let parameters: Parameters = [
            "username": userEmail!,
            "password": userPassword!
        ]
        let manager = Alamofire.SessionManager.default
        manager.session.configuration.timeoutIntervalForRequest = 20
        let myUrl = UserDefaults.standard.string(forKey: "HOST")! + "authenticate/login"
        manager.request(myUrl, method: .post, parameters: parameters).responseJSON { response in
            print("Request: \(response.request)")
            print("Response: \(response.response)")
            print("Error: \(response.error)")
            switch (response.result) {
            case .success(let data):
                let parseJSON = JSON(data)
                let users = parseJSON["user"]
                let token = parseJSON["token"].string
                let id = users["id"].int
                let role_id = users["role_id"].int
                let email = users["email"].string
                let first_name = users["first_name"].string
                let last_name = users["last_name"].string
                let phone = users["phone"].string
                let avatar = users["avatar"].string
                
                UserDefaults.standard.set(id, forKey: "id");
                UserDefaults.standard.set(role_id, forKey: "role_id");
                UserDefaults.standard.set(email, forKey: "email");
                UserDefaults.standard.set(token, forKey: "token");
                UserDefaults.standard.set(first_name, forKey: "first_name");
                UserDefaults.standard.set(last_name, forKey: "last_name");
                UserDefaults.standard.set(phone, forKey: "phone");
                UserDefaults.standard.set(avatar, forKey: "avatar");
                UserDefaults.standard.set(false, forKey: "didQuiz");
                
                //login is successful
                UserDefaults.standard.set(true,forKey: "isUserLoggedIn");
                UserDefaults.standard.synchronize();
                //self.dismiss(animated: true, completion: nil);
                DispatchQueue.main.async { // Correct
                    self.indicator.stopAnimating()
                    self.performSegue(withIdentifier: "FromLoginToCoursesView", sender: self)
                }
                break
            case .failure(let error):
                var message = error
                if error._code == NSURLErrorTimedOut {
                    message = "Request time out" as! Error
                }
                print("\n\nAuth request failed with error:\n \(error)")
                DispatchQueue.main.async { // Correct
                    self.indicator.stopAnimating()
                    let alert = UIAlertController(title: "Error", message: message as! String, preferredStyle: .alert)
                    
                    alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                    
                    self.present(alert, animated: true)
                }
                break
            }
            
        }
        
        
    }
    
    func ForgetPasswordTask(email : String){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "authenticate/forgot-password");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["email": email]
        
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
                            let alert = UIAlertController(title: "Confirmation", message: "Your request has been sent!", preferredStyle: .alert)
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

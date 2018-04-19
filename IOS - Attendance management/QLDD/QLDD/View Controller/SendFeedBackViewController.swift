//
//  SendFeedBackViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/24/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class SendFeedBackViewController: UITableViewController {

    var token = UserDefaults.standard.string(forKey: "token")
    var user_role = UserDefaults.standard.string(forKey: "role_id")
    @IBOutlet weak var TitleText: UITextField!
    @IBOutlet weak var ContenText: UITextView!
    @IBOutlet weak var AnonymousSwitch: UISwitch!
    override func viewDidLoad() {
        super.viewDidLoad()

        let saveButton = UIBarButtonItem(title: "Send", style: .done, target: self, action: #selector(SendFeedBackBtn))
        self.navigationItem.rightBarButtonItem = saveButton
        // Do any additional setup after loading the view.
    }
    
    override func viewWillAppear(_ animated: Bool) {
        self.token = UserDefaults.standard.string(forKey: "token")
        
    }
    
    
    @objc func SendFeedBackBtn(){
        SendFeedBackTask()
    }
    
    func SendFeedBackTask(){
        
        let title = TitleText.text
        let content = ContenText.text
        
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/feedback/send");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        var postString = ["token": token, "title": title, "content": content] as? [String: Any]
        if  AnonymousSwitch.isOn && self.user_role == "1"{
            postString = ["token": token, "title": title, "content": content, "isAnonymous": "true"] as? [String: Any]
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
                    print("result: \(resultValue)")
                    if (resultValue == "success"){
                        // do sth
                        
                        
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

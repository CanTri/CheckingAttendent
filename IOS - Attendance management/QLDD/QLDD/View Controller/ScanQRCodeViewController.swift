//
//  ScanQRCodeViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/25/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//
import AVFoundation
import MTBBarcodeScanner
import UIKit

class ScanQRCodeViewController: UIViewController {
    
    var token = UserDefaults.standard.string(forKey: "token")
    @IBOutlet var previewView: UIView!
    var scanner: MTBBarcodeScanner?
    let dispatchgroup = DispatchGroup()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        scanner = MTBBarcodeScanner(previewView: previewView)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        token = UserDefaults.standard.string(forKey: "token")
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        MTBBarcodeScanner.requestCameraPermission(success: { success in
            if success {
                do {
                    try self.scanner?.startScanning(resultBlock: { codes in
                        if let codes = codes {
                            for code in codes {
                                let stringValue = code.stringValue!
                                print("Found code: \(stringValue)")
                                self.dispatchgroup.enter()
                                self.SentAttendanceQRTask(url: stringValue)
                                self.scanner?.stopScanning()
                                self.dispatchgroup.wait(timeout: DispatchTime.now() + 5)
                            }
                        }
                    })
                } catch {
                    NSLog("Unable to start scanning")
                }
            } else {
                UIAlertView(title: "Scanning Unavailable", message: "This app does not have permission to access the camera", delegate: nil, cancelButtonTitle: nil, otherButtonTitles: "Ok").show()
            }
        })
        
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        self.scanner?.stopScanning()
        super.viewWillDisappear(animated)
    }
    
    func SentAttendanceQRTask(url: String){
        let myUrl = NSURL(string: url);
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": self.token] 
        
        do{
            request.httpBody = try JSONSerialization.data(withJSONObject: postString, options: .prettyPrinted)
        } catch let error{
            print(error.localizedDescription)
            return
        }
        
        
        let task = URLSession.shared.dataTask(with: request as URLRequest){
            (data: Data?, response: URLResponse?, error: Error?) in
            if error != nil{
                print("error_SentAttendanceQRTask=\(error)")
                //return
            }
            do {
                let json = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? NSDictionary
                if let parseJSON = json {
                    let resultValue = parseJSON["result"] as? String
                    print("result: \(resultValue)")
                    if (resultValue == "success"){
                        let alert = UIAlertController(title: "Confirmation", message: "QR code scanned completely! ", preferredStyle: .alert)
                        
                        alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: {action in
                            self.dispatchgroup.leave()
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
}

//
//  MoreViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/23/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit
import Alamofire
import AlamofireImage

class MoreViewController: UITableViewController, UIImagePickerControllerDelegate, UINavigationControllerDelegate {

    @IBOutlet weak var AvatarImageView: UIImageView!
    @IBOutlet weak var FirstNameLabel: UILabel!
    @IBOutlet weak var LastNameLabel: UILabel!
    @IBOutlet weak var EmailLabel: UILabel!
    @IBOutlet weak var PhoneLabel: UILabel!
    @IBOutlet weak var BackGroundImageView: UIImageView!
    @IBOutlet weak var PhotoGalleryButton: UIButton!
    var user_role = UserDefaults.standard.string(forKey: "role_id")
    
    override func viewDidLoad() {
        super.viewDidLoad()
        if self.user_role != "1"{
            self.PhotoGalleryButton.isHidden = true
        }
        else {
            self.PhotoGalleryButton.isHidden = false
        }
        
        let origImage = UIImage(named: "multiple")
        let tintedImage = origImage?.withRenderingMode(.alwaysTemplate)
        PhotoGalleryButton.setImage(tintedImage, for: .normal)
        PhotoGalleryButton.tintColor = UIColor.lightGray
        
        AvatarImageView.layer.borderWidth = 1.5
        AvatarImageView.layer.borderColor = UIColor.white.cgColor
        
        
        UpdateProfile()
        // Do any additional setup after loading the view.
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        UpdateProfile()
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let a = indexPath.section
        let b = indexPath.row
        print ("Selected: " + String(a) + " " + String(b))
        if a==2 && b==0 { //about us
            self.performSegue(withIdentifier: "showAboutUsView", sender: self)
        }
        else if a==3 && b == 0 { // send feedback
            self.performSegue(withIdentifier: "showSendFeedbackView", sender: self)
        }
        else if a==3 && b == 1 { // change password row
            self.performSegue(withIdentifier: "ChangePasswordView", sender: self)
        }
        else if a==3 && b == 2 { // change host
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
        else if a==3 && b == 3 { // log out row
            let alert = UIAlertController(title: "Confirmation", message: "Are you sure you want to log out this account?", preferredStyle: .alert)
            
            alert.addAction(UIAlertAction(title: "Log Out", style: .default, handler: {action in
                UserDefaults.standard.set(false,forKey: "isUserLoggedIn");
                UserDefaults.standard.synchronize();
                self.performSegue(withIdentifier: "FromMoreViewToLoginView", sender: self)
            }))
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
            
            self.present(alert, animated: true)
            
            
        }
        
        
    }
    
    @IBAction func PhotoGalleryButton(_ sender: UIButton) {
        self.performSegue(withIdentifier: "PhotoGalleryView", sender: self)
    }
    @IBAction func ButtonImageTapped(_ sender: UIButton) {
//        let alert = UIAlertController(title: "Attention", message: "This image are used for recognition! Just upload your own image.", preferredStyle: .actionSheet)
//
//        alert.addAction(UIAlertAction(title: "Use camera", style: .default, handler: {action in
//            if UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.camera) {
//                let imagePicker = UIImagePickerController()
//                imagePicker.delegate = self as! UIImagePickerControllerDelegate & UINavigationControllerDelegate
//                imagePicker.sourceType = UIImagePickerControllerSourceType.camera
//                imagePicker.allowsEditing = false
//                self.present(imagePicker, animated: true, completion: nil)
//            }
//        }))
//        alert.addAction(UIAlertAction(title: "Pick  photos", style: .default, handler: {action in
//            let controller = UIImagePickerController()
//            controller.delegate = self as? UIImagePickerControllerDelegate & UINavigationControllerDelegate
//            controller.sourceType = .photoLibrary
//            self.present(controller, animated: true, completion: nil)
//
//        }))
//        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
//
//        self.present(alert, animated: true)
        
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController){
        dismiss(animated: true, completion: nil)
    }
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        if let pickedImage = info[UIImagePickerControllerOriginalImage] as? UIImage {
            //self.AvatarImageView.contentMode = .scaleAspectFill
            self.AvatarImageView.image = pickedImage
            self.BackGroundImageView.image = pickedImage
        }
        picker.dismiss(animated: true, completion: nil)
    }
    
    func UpdateProfile(){
        FirstNameLabel.text = UserDefaults.standard.string(forKey: "first_name")
        LastNameLabel.text = UserDefaults.standard.string(forKey: "last_name")
        EmailLabel.text = UserDefaults.standard.string(forKey: "email")
        PhoneLabel.text = UserDefaults.standard.string(forKey: "phone")
        UpdateAvartarImage()
        
    }
    
    func UpdateAvartarImage(){
        var url = UserDefaults.standard.string(forKey: "avatar")
        
        Alamofire.request(url!).responseImage { response in
            debugPrint(response)
            print(response.request)
            print(response.response)
            debugPrint(response.result)
            
            if let image = response.result.value {
                self.AvatarImageView.image = image
                self.BackGroundImageView.image = image
            }
        }
    }
    


}

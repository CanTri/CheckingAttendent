//
//  BookAttendanceViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 3/23/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class BookAttendanceViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        let CameraButton = UIBarButtonItem(barButtonSystemItem: .camera, target: self, action: #selector(CameraButtonTapped) )
        self.navigationItem.rightBarButtonItems = [CameraButton]
    }

    @objc func CameraButtonTapped(){
        if UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.camera) {
            let imagePicker = UIImagePickerController()
            imagePicker.delegate = self as! UIImagePickerControllerDelegate & UINavigationControllerDelegate
            imagePicker.sourceType = UIImagePickerControllerSourceType.camera
            imagePicker.allowsEditing = false
            self.present(imagePicker, animated: true, completion: nil)
        }
        
        
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController){
        dismiss(animated: true, completion: nil)
    }
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        if let pickedImage = info[UIImagePickerControllerOriginalImage] as? UIImage {
            print (pickedImage)
        }
        picker.dismiss(animated: true, completion: nil)
    }

}

//
//  FaceRecognitionViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 3/22/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit
import Alamofire
import AlamofireImage
import SwiftyJSON
import BSImagePicker
import Photos


class FaceRecognitionViewController: UIViewController,UIImagePickerControllerDelegate, UINavigationControllerDelegate  {
    
    var course: Course?
    
    var token = UserDefaults.standard.string(forKey: "token")
    
    var faceRectArray = [CGRect]()
    
    @IBOutlet weak var NumberOfImageButton: UIButton!
    let myActivityIndicator = UIActivityIndicatorView(activityIndicatorStyle: UIActivityIndicatorViewStyle.gray)
    var detectedPersonArr = [DetectedPerson]()
    //let imagePickerController = UIImagePickerController()
    
    var pickPhotoArray = [UIImage]()
    var currentImageIndex = 0
    
    var imagewidth = 100
    var imageheight = 100
    
    var students = [Student]()

    @IBOutlet weak var FaceDetectedUIImage: UIImageView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        token = UserDefaults.standard.string(forKey: "token")
        
        self.getStudentTask()
        
        //imagePickerController.delegate = self
        
        let CameraButton = UIBarButtonItem(barButtonSystemItem: .camera, target: self, action: #selector(CameraButtonTapped) )
        self.navigationItem.rightBarButtonItems = [CameraButton]
        
        // Indicator
        myActivityIndicator.center = view.center
        myActivityIndicator.hidesWhenStopped = true
        myActivityIndicator.transform = CGAffineTransform(scaleX: 1.5, y: 1.5)
        view.addSubview(myActivityIndicator)
        
        //image
        self.imagewidth = Int(self.FaceDetectedUIImage.frame.width)
        self.imageheight = Int(self.FaceDetectedUIImage.frame.height)

    }
    @objc func CameraButtonTapped(){
        let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        alert.addAction(UIAlertAction(title: "Use camera", style: .default, handler: {action in
            if UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.camera) {
                let imagePicker = UIImagePickerController()
                imagePicker.delegate = self as! UIImagePickerControllerDelegate & UINavigationControllerDelegate
                imagePicker.sourceType = UIImagePickerControllerSourceType.camera
                imagePicker.allowsEditing = false
                self.present(imagePicker, animated: true, completion: nil)
            }
        }))
        alert.addAction(UIAlertAction(title: "Pick photos", style: .default, handler: {action in
            self.PickPhotoTask()
            
        }))
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        self.present(alert, animated: true)
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController){
        dismiss(animated: true, completion: nil)
    }
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        if let pickedImage = info[UIImagePickerControllerOriginalImage] as? UIImage {
//            let npickedImage = pickedImage.resizedTo1MB()
//            self.FaceDetectedUIImage.image = pickedImage
//            self.faceDetectionApiTask(currentImage: npickedImage!)
            self.FaceDetectedUIImage.image = pickedImage
            self.faceDetectionApiTask(currentImage: pickedImage)
            
            
        }
        picker.dismiss(animated: true, completion: nil)
    }
    
    func PickPhotoTask(){
        let vc = BSImagePickerViewController()
        vc.maxNumberOfSelections = 20
        vc.takePhotoIcon = UIImage(named: "chat")
        
        vc.albumButton.tintColor = UIColor.blue
        vc.cancelButton.tintColor = UIColor.darkGray
        vc.doneButton.tintColor = UIColor.purple
        vc.selectionCharacter = "✓"
        vc.selectionFillColor = UIColor.blue
        vc.selectionStrokeColor = UIColor.white
        vc.selectionShadowColor = UIColor.blue
        vc.selectionTextAttributes[NSAttributedStringKey.foregroundColor] = UIColor.white
        vc.cellsPerRow = {(verticalSize: UIUserInterfaceSizeClass, horizontalSize: UIUserInterfaceSizeClass) -> Int in
            switch (verticalSize, horizontalSize) {
            case (.compact, .regular): // iPhone5-6 portrait
                return 2
            case (.compact, .compact): // iPhone5-6 landscape
                return 2
            case (.regular, .regular): // iPad portrait/landscape
                return 3
            default:
                return 2
            }
        }
        
        bs_presentImagePickerController(vc, animated: true,
        select: { (asset: PHAsset) -> Void in
            //print("Selected: \(asset)")
        }, deselect: { (asset: PHAsset) -> Void in
            //print("Deselected: \(asset)")
        }, cancel: { (assets: [PHAsset]) -> Void in
            //print("Cancel: \(assets)")
        }, finish: { (assets: [PHAsset]) -> Void in
            self.FromAssetToPhotoArray(assets: assets)
            //print("Finish: \(assets)")
        }, completion: nil)
    }
    
    func FromAssetToPhotoArray(assets: [PHAsset]){
        self.pickPhotoArray.removeAll()
        for asset in assets{
            self.pickPhotoArray.append(self.getAssetThumbnail(asset: asset))
        }
        DispatchQueue.main.async {
            self.currentImageIndex = 0
            self.FaceDetectedUIImage.image = self.pickPhotoArray[self.currentImageIndex]
            self.numberOfCurrentImage(current: self.currentImageIndex + 1, total: self.pickPhotoArray.count)
        }
        
        
    }
    
    func getAssetThumbnail(asset: PHAsset) -> UIImage {
        let manager = PHImageManager.default()
        let option = PHImageRequestOptions()
        var thumbnail = UIImage()
        option.isSynchronous = true
        manager.requestImage(for: asset, targetSize: CGSize(width: self.imagewidth, height: self.imageheight ), contentMode: .aspectFit, options: option, resultHandler: {(result, info)->Void in
            thumbnail = result!
        })
        
        return thumbnail
    }
    
    @IBAction func RightButtonTapped(_ sender: UIButton) {
        self.currentImageIndex += 1
        if (self.currentImageIndex == self.pickPhotoArray.count){
            self.currentImageIndex = 0
        }
        self.FaceDetectedUIImage.image = self.pickPhotoArray[self.currentImageIndex]
        self.numberOfCurrentImage(current: self.currentImageIndex + 1, total: self.pickPhotoArray.count)
    }
    
    @IBAction func LeftButtonTapped(_ sender: UIButton) {
        self.currentImageIndex -= 1
        if (self.currentImageIndex < 0){
            self.currentImageIndex = self.pickPhotoArray.count - 1
        }
        self.FaceDetectedUIImage.image = self.pickPhotoArray[self.currentImageIndex]
        self.numberOfCurrentImage(current: self.currentImageIndex + 1, total: self.pickPhotoArray.count)
    }
    @IBAction func VerifyButtonTapped(_ sender: UIButton) {
        if (self.pickPhotoArray != nil && self.pickPhotoArray.count != 0){
            self.faceDetectionApiTask(currentImage: self.FaceDetectedUIImage.image!)
        }
    }
    @IBAction func CheckAllButtonTapped(_ sender: UIButton) {
        if (self.detectedPersonArr != nil && self.detectedPersonArr.count != 0 && students != nil && students.count != 0){
            for person in detectedPersonArr{
                var flag = false
                for student in students{
                    let foo = student.name
                    let bar = foo.folding(options: .diacriticInsensitive, locale: .current)
                    if (person.name == bar){
                        self.CheckPresentOrAbsentStudent(student_id: student.id)
                        flag = true
                        break
                        
                    }
                }
                if (flag){
                    break
                }
            }
        }
    }
    
    
    func convertImageToBase64(image: UIImage) -> String {
        
        let imageData:NSData = UIImagePNGRepresentation(image)! as NSData
        let dataImage = imageData.base64EncodedString(options: .lineLength64Characters)
        return dataImage
        
    }
    
    func faceDetectionApiTask(currentImage: UIImage){
        let base64String = self.convertImageToBase64(image: currentImage)
        //print(base64String)
        let parameters: Parameters = [
            "key": "tunghiep",
            "image": base64String,
            //"image": "https://image.ibb.co/bZgRVR/hinhtest.jpg", // test
            "gallery_name": "14ctt"
        ]
        self.myActivityIndicator.startAnimating()
        
        
        // All three of these calls are equivalent
        Alamofire.request("https:checkingattendance.000webhostapp.com/Kairos/recognize.php", method: .post, parameters: parameters).response { response in
            print("Request: \(response.request)")
            print("Response: \(response.response)")
            print("Error: \(response.error)")
            
            if let data = response.data, let utf8Text = String(data: data, encoding: .utf8) {
                do {
                    self.detectedPersonArr.removeAll()
                    let json = try JSON(data: data)
                    if let jsonArray = json["images"].array{
                        for jsonObj in jsonArray{
                            if (jsonObj["candidates"] != nil){
                                let nname = jsonObj["transaction"]["subject_id"].string
                                let dx = jsonObj["transaction"]["topLeftX"].int
                                let dy = jsonObj["transaction"]["topLeftY"].int
                                let width = jsonObj["transaction"]["width"].int
                                let height = jsonObj["transaction"]["height"].int
                                
                                self.detectedPersonArr.append(DetectedPerson(name: nname!, dx: dx!, dy: dy!, height: height! , width: width!))
                            }
                            
                        }
                        //print(self.detectedPersonArr)
                        self.drawTagImage()
                        
                    }
                    else{
                        
                        var message = json["Errors"][0]["Message"].string
                        

                        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
                        
                    
                        alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                        
                        self.present(alert, animated: true)
                    }
                    }catch {
                    print(error)
                }
            }
            
            self.myActivityIndicator.stopAnimating()
            
        }
    }
    
    func drawTagImage(){
        self.faceRectArray.removeAll()
        var finalImage = self.FaceDetectedUIImage.image
        for person in self.detectedPersonArr{
            finalImage = finalImage?.tagMe(name: person.name ,dx: person.dx, dy: person.dy, width: person.width, height: person.height)
            let rect = CGRect(x: person.dx + 50, y: person.dy + 50, width: person.width , height: person.height)
            self.faceRectArray.append(rect)
        }
        self.FaceDetectedUIImage.image = finalImage
    }
    
    // touch to check attendance
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let touch = touches.first {
            let position = touch.location(in: self.FaceDetectedUIImage)
            for (index,rect) in self.faceRectArray.enumerated(){
                if rect.contains(position){
                    let name = self.detectedPersonArr[index].name
                    for student in students{
                        let foo = student.name
                        let bar = foo.folding(options: .diacriticInsensitive, locale: .current)
                        if (name == bar){
                            self.CheckPresentOrAbsentStudent(student_id: student.id)
                            break
                            
                        }
                    }
                    break
                }
            }
            print(position)
        }
    }
    
    func numberOfCurrentImage(current: Int, total: Int){
        let string = String(current) + " / " + String (total)
        self.NumberOfImageButton.setTitle(string, for: .normal)
    }
    
    func getStudentTask(){
        students.removeAll()
        
        let parameters: Parameters = [
            "token": self.token!,
            "attendance_id": course?.attendance_id
        ]
        let manager = Alamofire.SessionManager.default
        manager.session.configuration.timeoutIntervalForRequest = 20
        let myUrl = UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/check-attendance"
        manager.request(myUrl, method: .post, parameters: parameters).responseJSON { response in
            print("Request: \(response.request)")
            print("Response: \(response.response)")
            print("Error: \(response.error)")
            switch (response.result) {
            case .success(let data):
                let parseJSON = JSON(data)
                //let result = parseJSON["result"]
                let studentlist = parseJSON["check_attendance_list"].array
                for temp in studentlist!{
                    let id = temp["id"].int
                    let code = temp["code"].string
                    let name = temp["name"].string
                    let status = temp["status"].int
                    let avatar = temp["avatar"].string
                    let answered_questions = temp["answered_questions"].string
                    let discussions = temp["discussions"].string
                    let presentations = temp["presentations"].string
                    
                    let student = Student(id: id!, code: code!, name: name!, status: status!, avatar: avatar!, answered_questions: answered_questions, discussions: discussions, presentations: presentations)
                    self.students.append(student)
                }
                break
            case .failure(let error):
                var message = error
                if error._code == NSURLErrorTimedOut {
                    message = "Request time out" as! Error
                }
                print("\n\nAuth request failed with error:\n \(error)")
                DispatchQueue.main.async { // Correct
                    let alert = UIAlertController(title: "Error", message: message as! String, preferredStyle: .alert)
                    
                    alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                    
                    self.present(alert, animated: true)
                }
                break
            }
            
        }
    }
    
    func CheckPresentOrAbsentStudent(student_id: Int){
        let parameters: Parameters = [
            "token": self.token!,
            "student_id": student_id ,
            "attendance_id": course?.attendance_id,
            "attendance_type": 1
        ]
        
        // All three of these calls are equivalent
        Alamofire.request(UserDefaults.standard.string(forKey: "HOST")! + "api/check-attendance/check-list", method: .post, parameters: parameters).response { response in
            print("Request: \(response.request)")
            print("Response: \(response.response)")
            print("Error: \(response.error)")
            
            if (response.error == nil){
                let alert = UIAlertController(title: "Success", message: "Students checked!", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                
                self.present(alert, animated: true)
            }
            else{
                let alert = UIAlertController(title: "Error", message: "Something is wrong!", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                
                self.present(alert, animated: true)
            }
            
            
        }
    }
    
    
}
extension UIImage {
    
    func tagMe(name: String, dx: Int, dy: Int, width: Int, height: Int)->UIImage {
        
        var startingImage = self
        // Create a context of the starting image size and set it as the current one
        UIGraphicsBeginImageContext(startingImage.size)
        
        // Draw the starting image in the current context as background
        //startingImage.draw(at: CGPoint(x: 50, y: 50))
        startingImage.draw(at: CGPoint.zero)
        
        // Get the current context
        let context = UIGraphicsGetCurrentContext()!
        
        //Draw name
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.alignment = .center
        
        let attributes = [NSAttributedStringKey.paragraphStyle  :  paragraphStyle,
                          //NSAttributedStringKey.font            :   UIFont.systemFont(ofSize: CGFloat(20000/width)),
                          NSAttributedStringKey.foregroundColor : UIColor.red,
                          ]
        
        let string = name
        string.draw(with: CGRect(x: dx , y: dy + height + 5, width: width, height: height), options: .usesLineFragmentOrigin, attributes: attributes, context: nil)
        
        // Draw a rectangle
        context.setStrokeColor(UIColor.red.cgColor)
        context.setAlpha(1)
        context.setLineWidth(3)
        context.addRect(CGRect(x: dx, y: dy, width: width, height: height))
        context.drawPath(using: .stroke) // or .fillStroke if need filling
        
        
        // Save the context as a new UIImage
        let myImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        // Return modified image
        return myImage!
    }
    
    
    
}

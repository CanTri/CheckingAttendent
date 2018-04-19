//
//  PhotoGalleryViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 3/6/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit
import Alamofire
import AlamofireImage
import SwiftyJSON


class PhotoGalleryViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    
    @IBOutlet weak var collectionView: UICollectionView!
    var myname = UserDefaults.standard.string(forKey: "first_name")! + " " + UserDefaults.standard.string(forKey: "last_name")!
    var PhotoArray = [UIImage?](repeating: nil, count: 0)
    var PhotoArrayUrl = [String]()
    let waitThreadToFinish = DispatchGroup()
    let myActivityIndicator = UIActivityIndicatorView(activityIndicatorStyle: UIActivityIndicatorViewStyle.gray)

    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        myname = myname.folding(options: .diacriticInsensitive, locale: .current)
        
        let SaveButton = UIBarButtonItem(title: "Save",style: .done, target: self, action: #selector(SaveButtonTapped) )
        self.navigationItem.rightBarButtonItems = [SaveButton]
        // Indicator
        myActivityIndicator.center = view.center
        myActivityIndicator.hidesWhenStopped = true
        myActivityIndicator.transform = CGAffineTransform(scaleX: 1.5, y: 1.5)
        myActivityIndicator.startAnimating()
        view.addSubview(myActivityIndicator)
        
        // Collection View
        var itemSize = UIScreen.main.bounds.width/3
        itemSize -= 3
        
        let layout = UICollectionViewFlowLayout()
        layout.sectionInset = UIEdgeInsetsMake(20, 0, 10, 0)
        layout.itemSize = CGSize(width: itemSize, height: itemSize)
        
        layout.minimumInteritemSpacing = 3
        layout.minimumLineSpacing = 3
        
        collectionView.collectionViewLayout = layout

        // Do any additional setup after loading the view.
        
        self.GetPhotoArray()
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        myname = myname.folding(options: .diacriticInsensitive, locale: .current)

    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return PhotoArray.count
    }

    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "PhotoCell", for: indexPath) as! CustomPhotoCollectionViewCell
        
        cell.imageCell.image = PhotoArray[indexPath.row]
        
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        alert.addAction(UIAlertAction(title: "Set as profile picture", style: .default, handler: {action in
            UserDefaults.standard.set(self.PhotoArrayUrl[indexPath.row], forKey: "avatar")
        }))
        
        alert.addAction(UIAlertAction(title: "Delete", style: .destructive, handler: {action in
            self.PhotoArray.remove(at: indexPath.row)
            self.PhotoArrayUrl.remove(at: indexPath.row)
            self.collectionView.reloadData()
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        self.present(alert, animated: true)
    }
    @IBAction func AddButtonTapped(_ sender: UIButton) {
        if PhotoArray.count < 5 {
            let alert = UIAlertController(title: "Attention", message: "These images are used for recognition! Just upload your own images.", preferredStyle: .actionSheet)
            
            alert.addAction(UIAlertAction(title: "Use camera", style: .default, handler: {action in
                if UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.camera) {
                    let imagePicker = UIImagePickerController()
                    imagePicker.delegate = self as! UIImagePickerControllerDelegate & UINavigationControllerDelegate
                    imagePicker.sourceType = UIImagePickerControllerSourceType.camera
                    imagePicker.allowsEditing = false
                    self.present(imagePicker, animated: true, completion: nil)
                }
            }))
            alert.addAction(UIAlertAction(title: "Pick a photo", style: .default, handler: {action in
                let controller = UIImagePickerController()
                controller.delegate = self as? UIImagePickerControllerDelegate & UINavigationControllerDelegate
                controller.sourceType = .photoLibrary
                self.present(controller, animated: true, completion: nil)
                
            }))
            
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
            
            self.present(alert, animated: true)
        }
        else {
            let alert = UIAlertController(title: "Attention", message: "You can only upload 5 images ! Please delete some pictures !", preferredStyle: .alert)
            
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
            
            self.present(alert, animated: true)
        }
    }
    
    func GetPhotoArray(){
        self.PhotoArrayUrl.removeAll()
        
        let parameters: Parameters = [
            "name": myname
        ]
        
        // All three of these calls are equivalent
        Alamofire.request("http://tunghiepandroid.pe.hu/UploadAPI/getimageapi.php", method: .post, parameters: parameters).response { response in
            print("Request: \(response.request)")
            print("Response: \(response.response)")
            print("Error: \(response.error)")
            
            if let data = response.data, let utf8Text = String(data: data, encoding: .utf8) {
                do {
                    let json = try JSON(data: data)
                    let jsonArray = json.array
                    //let njson = jsonArray![0] as! JSON
                    let original_links = jsonArray![0]["link"].stringValue
                    var myStringArr = original_links.components(separatedBy: "$")
                    if myStringArr.count > 0 {
                        myStringArr.remove(at: myStringArr.count - 1)
                    }
                    self.PhotoArrayUrl = myStringArr
                    self.PhotoArray = [UIImage?](repeating: nil, count: self.PhotoArrayUrl.count)
                    self.updateImageToPhotoArray()
                    
                } catch {
                    print(error)
                }
            }
            
        }
    }
    
    @objc func SaveButtonTapped(){
        if self.myActivityIndicator.isAnimating{
            let alert = UIAlertController(title: "Attention", message: "Please just wait a little bit!", preferredStyle: .alert)
            
            alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
            
            self.present(alert, animated: true)
        }
        else {
            self.myActivityIndicator.startAnimating()
            self.uploadUrlToServer(allUrlImages: self.getAllPhotoURls())
        }
        
        
        
    }
    
    func uploadUrlToServer(allUrlImages: String){ //Upload or Delete image
        let parameters: Parameters = [
            "link": allUrlImages,
            "name": self.myname
        ]
        Alamofire.request("http://tunghiepandroid.pe.hu/UploadAPI/updateimageapi.php", method: .post, parameters: parameters).response { response in
            print("Request: \(response.request)")
            print("Response: \(response.response)")
            print("Error: \(response.error)")
            
            if let data = response.data, let utf8Text = String(data: data, encoding: .utf8) {
                let alert = UIAlertController(title: "Success", message: "All images have been saved!", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: nil))
                
                self.present(alert, animated: true)
                self.GetPhotoArray()
                self.myActivityIndicator.stopAnimating()
            }

        }
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController){
        dismiss(animated: true, completion: nil)
    }
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        if let pickedImage = info[UIImagePickerControllerOriginalImage] as? UIImage {
            let npickedImage = pickedImage.resizedToMB()
            self.PhotoArray.append(npickedImage)
            collectionView.reloadData()
            self.myActivityIndicator.startAnimating()
            self.getUrlImageFromImage(currentImage: npickedImage!)
            
        }
        picker.dismiss(animated: true, completion: nil)
    }
    
    func updateImageToPhotoArray(){
        for (i,url) in self.PhotoArrayUrl.enumerated(){
            //waitThreadToFinish.enter()
            self.getImageFromUrl(URL_IMAGE: url, index: i)
            //waitThreadToFinish.wait(timeout: DispatchTime.now() + 2)
        }
        self.collectionView.reloadData()
        self.myActivityIndicator.stopAnimating()
    }
    
    func getImageFromUrl(URL_IMAGE : String, index: Int){
        Alamofire.request(URL_IMAGE).responseImage { response in
            debugPrint(response)
            
            print(response.request)
            print(response.response)
            debugPrint(response.result)
            
            if let image = response.result.value {
                self.PhotoArray[index] = image
                self.collectionView.reloadData()
                //self.waitThreadToFinish.leave()
            }
        }
    }
    
    func getUrlImageFromImage(currentImage: UIImage) {
        let base64String = self.convertImageToBase64(image: currentImage)
        var urlImage = ""
        let parameters: Parameters = [
            "image": base64String
        ]
        
        
        // All three of these calls are equivalent
        Alamofire.request("http://tunghiepandroid.pe.hu/UploadAPI/imgur.php", method: .post, parameters: parameters).response { response in
            print("Request: \(response.request)")
            print("Response: \(response.response)")
            print("Error: \(response.error)")
            
            let data = response.data
            let utf8Text = String(data: data!, encoding: .utf8)
            self.PhotoArrayUrl.append(utf8Text!)
            self.myActivityIndicator.stopAnimating()
            
        }
        
    }
    
    func getAllPhotoURls() -> String {
        var result = ""
        for url in self.PhotoArrayUrl{
            result += url + "$"
        }
        return result
    }
    
    func convertImageToBase64(image: UIImage) -> String {
        
        let imageData:NSData = UIImagePNGRepresentation(image)! as NSData
        let dataImage = imageData.base64EncodedString(options: .lineLength64Characters)
        
        return dataImage
        
    }

}
extension UIImage {
    enum JPEGQuality: CGFloat {
        case lowest  = 0
        case low     = 0.25
        case medium  = 0.5
        case high    = 0.75
        case highest = 1
    }
    
    /// Returns the data for the specified image in JPEG format.
    /// If the image object’s underlying image data has been purged, calling this function forces that data to be reloaded into memory.
    /// - returns: A data object containing the JPEG data, or nil if there was a problem generating the data. This function may return nil if the image has no data or if the underlying CGImageRef contains data in an unsupported bitmap format.
    func jpeg(_ quality: JPEGQuality) -> Data? {
        return UIImageJPEGRepresentation(self, quality.rawValue)
    }
    func resized(withPercentage percentage: CGFloat) -> UIImage? {
        let canvasSize = CGSize(width: size.width * percentage, height: size.height * percentage)
        UIGraphicsBeginImageContextWithOptions(canvasSize, false, scale)
        defer { UIGraphicsEndImageContext() }
        draw(in: CGRect(origin: .zero, size: canvasSize))
        return UIGraphicsGetImageFromCurrentImageContext()
    }
    
    func resizedToMB() -> UIImage? {
        guard let imageData = UIImagePNGRepresentation(self) else { return nil }
        
        var resizingImage = self
        var imageSizeKB = Double(imageData.count) / 1000.0 // ! Or devide for 1024 if you need KB but not kB
        
        while imageSizeKB > 100 { // ! Or use 1024 if you need KB but not kB
            guard let resizedImage = resizingImage.resized(withPercentage: 0.9),
                let imageData = UIImagePNGRepresentation(resizedImage)
                else { return nil }
            
            resizingImage = resizedImage
            imageSizeKB = Double(imageData.count) / 1000.0 // ! Or devide for 1024 if you need KB but not kB
        }
        
        return resizingImage
    }
    
    func resizedTo1MB() -> UIImage? {
        guard let imageData = UIImagePNGRepresentation(self) else { return nil }
        
        var resizingImage = self
        var imageSizeKB = Double(imageData.count) / 1000.0 // ! Or devide for 1024 if you need KB but not kB
        
        while imageSizeKB > 700 { // ! Or use 1024 if you need KB but not kB
            guard let resizedImage = resizingImage.resized(withPercentage: 0.9),
                let imageData = UIImagePNGRepresentation(resizedImage)
                else { return nil }
            
            resizingImage = resizedImage
            imageSizeKB = Double(imageData.count) / 1000.0 // ! Or devide for 1024 if you need KB but not kB
        }
        
        return resizingImage
    }
}

//
//  QRCodeViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/21/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class QRCodeViewController: UIViewController {
    
    var attendanceID: Int?

    @IBOutlet weak var QRCodeImage: UIImageView!
    override func viewDidLoad() {
        super.viewDidLoad()
        let text = "api/check-attendance/qr-code/" + String(describing: attendanceID)
        let data = text.data(using: .ascii, allowLossyConversion: false)
        let filter = CIFilter(name: "CIQRCodeGenerator")
        filter?.setValue(data, forKey:"inputMessage")
        let transform = CGAffineTransform(scaleX: 10, y:10)
        let image = UIImage(ciImage: (filter?.outputImage!.transformed(by: transform))!)
        
        QRCodeImage.image = image
    }


}

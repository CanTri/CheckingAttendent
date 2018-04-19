//
//  CustomCourseTableViewCell.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/25/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class CustomCourseTableViewCell: UITableViewCell {


    @IBOutlet weak var OpenningLabel: UILabel!
    @IBOutlet weak var CourseNameLabel: UILabel!
    @IBOutlet weak var CourseDetailLabel: UILabel!
    @IBOutlet weak var cellView: UIView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}

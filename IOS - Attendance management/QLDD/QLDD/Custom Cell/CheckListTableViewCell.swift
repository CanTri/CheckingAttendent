//
//  CheckListTableViewCell.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/26/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class CheckListTableViewCell: UITableViewCell {

    @IBOutlet weak var CheckListView: UIView!
    @IBOutlet weak var AvatarImageView: UIImageView!
    @IBOutlet weak var NameStudentLabel: UILabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}

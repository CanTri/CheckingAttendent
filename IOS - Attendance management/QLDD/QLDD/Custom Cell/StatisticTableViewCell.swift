//
//  StatisticTableViewCell.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/25/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class StatisticTableViewCell: UITableViewCell {

    @IBOutlet weak var HIstoryDateLabel: UILabel!
    @IBOutlet weak var HIstoryStatusDateLabel: UILabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}

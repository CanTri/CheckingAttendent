//
//  AttendanceDetail.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/25/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import Foundation

struct AttendanceDetail {
    var created_at : String
    var type : Int
    var edit_reason: String
    
    init(){
        self.created_at = ""
        self.type = 0
        self.edit_reason = ""
    }
}

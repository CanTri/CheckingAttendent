//
//  CourseStatistic.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/25/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import Foundation

struct CourseStatistic {
    var code : String
    var name : String
    var attendanceCounts : Int
    var absenceCounts : Int
    var attendanceDetails : [AttendanceDetail]
    
    init(){
        self.code = ""
        self.name = ""
        self.attendanceCounts = 0
        self.absenceCounts = 0
        self.attendanceDetails = [AttendanceDetail]()
    }
}

//
//  Course.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/10/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import Foundation

struct Course{
    var id: Int
    var code: String
    var name: String
    var `class`: Int
    var class_name: String
    var chcid: Int
    var total_stud: Int
    var schedule: String?
    var office_hour: String?
    var note: String?
    var attendance_id: Int
    var open: Int?
    
    init(id: Int?, code: String?, name: String?, `class`: Int?, class_name: String?, chcid: Int?, total_stud: Int?, schedule: String?, office_hour: String?, note: String?) {
        self.id = id!
        self.code =  code!
        self.name =  name!
        self.`class` =  `class`!
        self.class_name =  class_name!
        self.chcid =  chcid!
        self.total_stud =  total_stud!
        self.schedule =  schedule
        self.office_hour =  office_hour
        self.note =  note
        self.attendance_id = 0
        self.open = 0
    }
    
    init(){
        self.id = 0
        self.code =  ""
        self.name =  ""
        self.`class` = 0
        self.class_name =  ""
        self.chcid =  0
        self.total_stud =  0
        self.schedule =  ""
        self.office_hour =  ""
        self.note =  ""
        self.attendance_id = 0
        self.open = 0
    }
    
}

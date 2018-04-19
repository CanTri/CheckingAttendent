//
//  Student.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/11/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import Foundation
struct Student {
    var id : Int
    var code : String
    var name : String
    var status : Int
    var avatar : String
    var answered_questions : String
    var discussions : String
    var presentations : String
    
    init(id: Int, code : String, name : String, status: Int, avatar: String, answered_questions: String?, discussions: String?, presentations: String?) {
        self.id = id
        self.code = code
        self.name = name
        self.status = status
        self.avatar = avatar
        if answered_questions != nil{
            self.answered_questions = answered_questions!
        }
        else{
            self.answered_questions = ""
        }
        
        if discussions != nil{
            self.discussions = discussions!
        }
        else{
            self.discussions = ""
        }
        
        if presentations != nil{
            self.presentations = presentations!
        }
        else{
            self.presentations = ""
        }
    }
}

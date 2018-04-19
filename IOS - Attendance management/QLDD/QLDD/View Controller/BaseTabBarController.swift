//
//  BaseTabBarController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 1/22/18.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit
import SwiftyJSON
import Alamofire

class BaseTabBarController: UITabBarController {

    var token = UserDefaults.standard.string(forKey: "token")
    var id = UserDefaults.standard.string(forKey: "id")
    var user_role = UserDefaults.standard.string(forKey: "role_id")
    var courses = [Course]()
    let waitThreadToFinish = DispatchGroup()
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        
            self.token = UserDefaults.standard.string(forKey: "token")
            self.id = UserDefaults.standard.string(forKey: "id")
            self.user_role = UserDefaults.standard.string(forKey: "role_id")
            self.tabBarController?.selectedIndex = 0
            waitThreadToFinish.enter()
            downloadCourse()
            waitThreadToFinish.wait(timeout: DispatchTime.now() + 2)
        
        
    }
    func downloadCourse(){
        token = UserDefaults.standard.string(forKey: "token")
        id = UserDefaults.standard.string(forKey: "id")
        
        self.courses.removeAll()
        
        var myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/course/teaching");
        if Int(user_role!)! == 1{ //student_role
            myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/course/studying");
        }
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token]
        
        do{
            request.httpBody = try JSONSerialization.data(withJSONObject: postString, options: .prettyPrinted)
        } catch let error{
            print(error.localizedDescription)
            return
        }
        
        
        let task = URLSession.shared.dataTask(with: request as URLRequest){
            (data: Data?, response: URLResponse?, error: Error?) in
            if error != nil{
                print("error=\(error)")
                return
            }
            do {
                let json = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? NSDictionary
                if let parseJSON = json {
                    let resultValue = parseJSON["result"] as? String
                    print("result_downloadCourse(): \(resultValue)")
                    if (resultValue == "success"){
                        let length = parseJSON["total_items"] as? Int
                        let coursesJSON = parseJSON["courses"] as? [[String:Any]]
                        for courseJSON in coursesJSON!{
                            
                            let id = courseJSON["id"] as? Int
                            let code = courseJSON["code"] as? String
                            let name = courseJSON["name"] as? String
                            let `class` = courseJSON["class"] as? Int
                            let class_name = courseJSON["class_name"] as? String
                            let chcid = courseJSON["chcid"] as? Int
                            let total_stud = courseJSON["total_stud"] as? Int
                            let schedule = courseJSON["schedule"] as? String
                            let office_hour = courseJSON["office_hour"] as? String
                            let note = courseJSON["note"] as? String
                            
                            //                            office_hour = "0"
                            //                            note = "0"
                            
                            let course = Course (id: id,code: code,name: name,class: `class`,class_name: class_name,chcid: chcid,total_stud: total_stud,schedule: schedule,office_hour: office_hour,note: note)
                            
                            self.courses.append(course)
                        }
                        self.GetOpeningCourseTask()
                        
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
        
    }

    
    func GetOpeningCourseTask(){
        var myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/opening-by-teacher");
        
        
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        var postString = ["token": token,"teacher_id":id, "isMobile": 1] as [String : Any]
        if Int(user_role!)! == 1{ //student_role
            myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/opening-for-student");
        }
        
        do{
            request.httpBody = try JSONSerialization.data(withJSONObject: postString, options: .prettyPrinted)
        } catch let error{
            print(error.localizedDescription)
            return
        }
        
        
        let task = URLSession.shared.dataTask(with: request as URLRequest){
            (data: Data?, response: URLResponse?, error: Error?) in
            if error != nil{
                print("error=\(error)")
                return
            }
            do {
                let json = try JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? NSDictionary
                if let parseJSON = json {
                    let resultValue = parseJSON["result"] as? String
                    print("result_GetOpeningCourseTask(): \(resultValue)")
                    if (resultValue == "success"){
                        var openningCoursesId = [String]()
                        var attendance_id = [String]()
                        
                        let openning_attendances = parseJSON["opening_attendances"] as? [[String:Any]]
                        for temp in openning_attendances!{
                            let nattendance_id = temp["attendance_id"] as? Int
                            let class_has_course_id = temp["class_has_course_id"] as? Int
                            openningCoursesId.append(String(class_has_course_id!))
                            attendance_id.append(String(nattendance_id!))
                        }
                        
                        UserDefaults.standard.set(openningCoursesId, forKey: "openningCoursesId")
                        UserDefaults.standard.set(attendance_id, forKey: "attendance_id")
                        
                        self.CheckOpenningCourse()
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
        
    }
    
    
    func CheckOpenningCourse(){
        let openningCoursesId = UserDefaults.standard.stringArray(forKey: "openningCoursesId")
        let attendance_id = UserDefaults.standard.stringArray(forKey: "attendance_id")
        
        let length = openningCoursesId?.count
        var index = 0
        while index < self.courses.count{
            self.courses[index].open = 0
            let class_has_course_id = String(self.courses[index].chcid)
            var flag = Bool(false)
            var i = 0
            while i < length!{
                if openningCoursesId![i] == class_has_course_id{
                    flag = true
                    //self.courses[index].attendance_id = i
                    self.courses[index].attendance_id = Int(attendance_id![i])!
                    self.courses[index].open = 1
                    break
                }
                i+=1
            }
            
            
            
            index+=1
        }
        
        self.waitThreadToFinish.leave()
        
    }
    
    
    


}

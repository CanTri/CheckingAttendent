//
//  ViewController.swift
//  QLDD
//
//  Created by Bui Nhat Khoi on 12/25/17.
//  Copyright © 2018 Bui Nhat Khoi. All rights reserved.
//

import UIKit

class CoursesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {


    @IBOutlet weak var OpenCourseList: UITableView!
    var token = UserDefaults.standard.string(forKey: "token")
    var id = UserDefaults.standard.string(forKey: "id")
    var user_role = UserDefaults.standard.string(forKey: "role_id")
    var courses = [Course]()
    var listCourseStatistic = [CourseStatistic]()
    let dispatchGroup = DispatchGroup()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        OpenCourseList.delegate = self
        OpenCourseList.dataSource = self
    }
    
    override func viewWillAppear(_ animated: Bool) {
        
        self.token = UserDefaults.standard.string(forKey: "token")
        self.id = UserDefaults.standard.string(forKey: "id")
        self.user_role = UserDefaults.standard.string(forKey: "role_id")
        
        if self.user_role == "1" {
            dispatchGroup.enter()
            GetCoursesStudentTask()
            dispatchGroup.wait(timeout: DispatchTime.now() + 2)
        }
        else {
            self.reloadCoursesFromBase()
            self.OpenCourseList.reloadData()
        }
        
        
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if user_role == "1"{
            return self.listCourseStatistic.count
        }
        else {
            return self.courses.count
        }
        
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 100
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = self.OpenCourseList.dequeueReusableCell(withIdentifier: "customCourseCell") as! CustomCourseTableViewCell
        
        if user_role == "1" && self.listCourseStatistic.count != 0{
            let list = self.listCourseStatistic[indexPath.row]
            cell.CourseNameLabel.text = list.name
            cell.CourseDetailLabel.text = list.code
            cell.OpenningLabel.isHidden = true
        }
        else {
            let course = self.courses[indexPath.row]
            cell.CourseNameLabel.text = course.name
            cell.CourseDetailLabel.text = course.code + " - " + course.class_name
            if course.open == 1{
                cell.OpenningLabel.isHidden = false
            }
            else {
                cell.OpenningLabel.isHidden = true
            }
        }
        
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if self.user_role == "1" {
            performSegue(withIdentifier: "FromCourseToStatistic", sender: self)
        }
        else{
            if (self.courses[(OpenCourseList.indexPathForSelectedRow?.row)!].attendance_id != 0){
                performSegue(withIdentifier: "showSelectedCourseDetail", sender: self)
            }
            else{
                let alert = UIAlertController(title: "Confirmation", message: "Open attendance for this course", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Agree", style: .default, handler: {action in
                    self.CreateAttendIDTask(classID: self.courses[indexPath.row].class,courseID: self.courses[indexPath.row].id)
                }))
                alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
                
                self.present(alert, animated: true)
            }
        }
        
        
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if let destination = segue.destination as? OpenningCourseDetailViewController{
            destination.course = self.courses[(OpenCourseList.indexPathForSelectedRow?.row)!]
        }
        else if let destination = segue.destination as? StaticticViewController{
            destination.courseStatic = self.listCourseStatistic[(OpenCourseList.indexPathForSelectedRow?.row)!]
        }
    }
    
    func CreateAttendIDTask(classID: Int, courseID: Int){
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/create");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token, "class_id": classID, "course_id": courseID] as? [String: Any]
        
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
                    print("result_CreateAttendIDTask: \(resultValue)")
                    if (resultValue == "success"){
                        let alert = UIAlertController(title: "Confirmation", message: "Course open successfully", preferredStyle: .alert)
                        
                        alert.addAction(UIAlertAction(title: "Close", style: .cancel, handler: { action in
                            self.reloadCoursesFromBase()
                            self.OpenCourseList.reloadData()
                        }))
                        
                        self.present(alert, animated: true)
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    
    func GetCoursesStudentTask(){
        self.listCourseStatistic.removeAll()
        let myUrl = NSURL(string: UserDefaults.standard.string(forKey: "HOST")! + "api/attendance/list-by-student");
        let request = NSMutableURLRequest(url: myUrl! as URL);
        request.httpMethod = "POST";
        request.addValue("application/json", forHTTPHeaderField: "content-type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let postString = ["token": token, "student_id": self.id] as? [String: Any]
        
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
                    print("result_GetCoursesStudentTask: \(resultValue)")
                    if (resultValue == "success"){
                        let attendance_list_by_student = parseJSON["attendance_list_by_student"] as? [[String:Any]]
                        for courseDetail in attendance_list_by_student!{
                            var courseStatistic = CourseStatistic()
                            courseStatistic.name = courseDetail["name"] as! String
                            courseStatistic.code = courseDetail["code"] as! String
                            courseStatistic.attendanceCounts = courseDetail["attendance_count"] as! Int
                            courseStatistic.absenceCounts = 0
                            
                            var attendanceDetails = courseDetail["attendance_details"] as? [[String:Any]]
                            for ad in attendanceDetails!{
                                var attendanceDetail1 = AttendanceDetail()
                                attendanceDetail1.created_at = ad["created_at"] as! String
                                attendanceDetail1.type = ad["attendance_type"] as! Int
                                //attendanceDetail1.edit_reason = ad["edited_reason"] as! String
                                courseStatistic.attendanceDetails.append(attendanceDetail1)
                                
                                if attendanceDetail1.type != 1 {
                                    courseStatistic.absenceCounts += 1
                                }
                            }
                            
                            self.listCourseStatistic.append(courseStatistic)
                            
                            
                        }
                        self.dispatchGroup.leave()
                        DispatchQueue.main.async { // Correct
                            self.OpenCourseList.reloadData()

                        }
                        
                    }
                }
            }catch {
                print("Error")
            }
            
        }
        task.resume()
    }
    
    func getCoursesFromBase(){
        self.courses.removeAll()
        let tabBar = tabBarController as! BaseTabBarController
        for temp in tabBar.courses{
            self.courses.append(temp)
        }
        self.OpenCourseList.reloadData()
    }
    
    func reloadCoursesFromBase(){
        let tabBar = tabBarController as! BaseTabBarController
        tabBar.waitThreadToFinish.enter()
        tabBar.downloadCourse()
        tabBar.waitThreadToFinish.wait()
        self.getCoursesFromBase()
        self.OpenCourseList.reloadData()
        
        
    }
    
    
}



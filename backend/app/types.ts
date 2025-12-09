export default {
  Server: Symbol('Server'),
  Application: Symbol('Application'),

  /**
   * Controllers
   */
  DatabaseController: Symbol('DatabaseController'),
  SocketController: Symbol('SocketController'),
  /**
   * Services
   */
  PartiesService: Symbol('PartiesService'),
  DJAIService: Symbol('DJAIService'),

  // Connection to the databse
  DatabaseConnectionService: Symbol('DatabaseConnectionService'),
  DatabaseService: Symbol('DatabaseService'),

  // Services related to paths
  PathContentService: Symbol('PathContentService'),
  PathInfoService: Symbol('PathContentService'),
  PathEditorService: Symbol('PathEditorService'),

  // Services related to courses
  CourseService: Symbol('CourseService'),
  ScraperService: Symbol('ScraperService'),

  // Services related to departments
  AffixesService: Symbol('AffixesService'),

  // Services related to accounts
  AccountService: Symbol('AccountService'),

  // Services related to comments
  CommentService: Symbol('CommentService')

}

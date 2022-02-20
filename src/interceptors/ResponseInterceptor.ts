import { Interceptor, InterceptorInterface, Action } from 'routing-controllers';

@Interceptor()
export class NameCorrectionInterceptor implements InterceptorInterface {
  intercept(action: Action, content: any) {
    const jsonData = {
      success: true,
      httpCode: action.response.statusCode,
      result: content,
    };
    return jsonData;
  }
}

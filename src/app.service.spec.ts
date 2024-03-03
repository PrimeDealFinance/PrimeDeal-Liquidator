import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('ErrorHandlingService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Если AppService объявлен в AppModule
    }).compile();

    service = module.get<AppService>(AppService); // Исправлено: использование метода get на TestingModule
  });

  it('should catch the error in getErr method', () => {
    expect(service.getTest()).toBeUndefined();
    // Или любое другое утверждение, соответствующее вашей логике обработки ошибок
  });
});

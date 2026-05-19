import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  xmlContent!: string;
}

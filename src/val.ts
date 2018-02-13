// import {
//   validate,
//   Contains,
//   IsInt,
//   Length,
//   IsEmail,
//   IsFQDN,
//   IsDate,
//   Min,
//   Max,
//   ValidateNested,
// } from 'class-validator';
// import { transformAndValidateSync } from 'class-transformer-validator';

// export class Author {
//   @Min(0)
//   id: number;

//   name: string;
// }

// export class Post {
//   @Length(10, 20)
//   title: string;

//   // @Contains('hello') text: string;

//   // @IsInt()
//   // @Min(0)
//   // @Max(10)
//   // rating: number;

//   // @IsEmail() email: string;

//   // @IsFQDN() site: string;

//   // @IsDate() createDate: Date;

//   @ValidateNested() author: Author;
// }

// let post = new Post();
// post.title = 'Hello'; // should not pass
// // post.text = 'this is a great post about hell world'; // should not pass
// // post.rating = 11; // should not pass
// // post.email = 'google.com'; // should not pass
// // post.site = 'googlecom'; // should not pass
// post.author = { name: 123 } as Author;

// try {
//   transformAndValidateSync(Post, { title: 'a', author: { name: 123 } });
// } catch (e) {
//   console.log(e);
// }
// // validate(post, { validationError: { target: false } }).then(errors => {
// //   // errors is an array of validation errors
// //   if (errors.length > 0) {
// //     console.log('validation failed. errors: ', errors);
// //   } else {
// //     console.log('validation succeed');
// //   }
// // });

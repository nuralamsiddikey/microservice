import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
   return this.productService.create(createProductDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('my-products')
  @UseGuards(AuthGuard)
  findMyProducts(@Request() req) {
    return this.productService.findByUserId(req.user.sub);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    return this.productService.update(id, updateProductDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.productService.remove(id, req.user.sub);
  }
}

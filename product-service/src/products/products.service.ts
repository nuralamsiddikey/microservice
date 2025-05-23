import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    userId: string,
  ): Promise<{ message: string; data: Product }> {
    const product = new this.productModel({
      ...createProductDto,
      userId,
    });

    const result = await product.save();

    return {
      message: 'Successfully created the product',
      data: result,
    };
  }

  async findAll(): Promise<{ message: string; data: Product[] }> {
    const result = await this.productModel.find().exec();
    return {
      message: 'Successfully fetched products',
      data: result,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findByUserId(userId: string): Promise<Product[]> {
    return this.productModel.find({ userId }).exec();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<{ message: string; data: Product }> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Failed to update product');
    }

    return {
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const product = await this.findOne(id);

    if (product.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this product',
      );
    }

    await this.productModel.findByIdAndDelete(id).exec();
    return { message: 'Product deleted successfully' };
  }
}

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { INTERNAL_SERVER_ERROR_SERVICE_RESPONSE, INVALID_ID_SERVICE_RESPONSE, UNAUTHORIZED, ServiceResponse } from "$entities/Service";
import Logger from '$pkg/logger';
import * as xlsx from "xlsx";

const prisma = new PrismaClient()
type DataItem = Record<string, any>;

export async function get(req: Request, res: Response): Promise<ServiceResponse<{}>> {
  try {
      // mengambil filter apa saja yang ada di dalam Query Request
    let { page = 1, perPage = 10, filters, searchFilters, rangedFilters, orderKey, orderRule, module } = req.query;
    const userId = req.user ? req.user.userId : null;
 
    if (!userId) {
      Logger.error(`FileService.get : Unauthorized`);
      return UNAUTHORIZED;
    }

    if (!module || typeof module !== 'string') {
      Logger.error(`FileService.get : INVALID MODULE`);
      return INVALID_ID_SERVICE_RESPONSE
    }
 
    // mengambil data dari database
    const where: any = { module }; 
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
      }),
      prisma.file.count({ where }),
    ]);

    // Hanya mengambil dataFile dari setiap Record yang sebelumnya di ambil dari database
    let allDataFiles: DataItem[] = [];
    files.forEach(file => {
      if (Array.isArray(file.dataFile)) {
        allDataFiles = allDataFiles.concat(file.dataFile);
      }
    });
 
    // Menghapus duplikasi yang ada pada setiap dataFile agar mengurangi redundant
    const seen = new Set();
    allDataFiles = allDataFiles.filter(item => {
      const key = JSON.stringify(item); 
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Menjalankan Fix Filter (Normal Filter), Contains Filter (searchFilters), Ranged Filter (rangedFilters)
    if (filters) {
      const parsedFilters = JSON.parse(filters as string);
      for (const key in parsedFilters) {
        const values = Array.isArray(parsedFilters[key]) ? parsedFilters[key] : [parsedFilters[key]];
        allDataFiles = allDataFiles.filter(item =>
          item && typeof item === 'object' && values.includes((item as DataItem)[key])
        );
      }
    }

    if (searchFilters) {
      const parsedSearch = JSON.parse(searchFilters as string);
      for (const key in parsedSearch) {
        const searchValue = parsedSearch[key].toLowerCase();
        allDataFiles = allDataFiles.filter(item =>
          item && typeof item === 'object' && ((item as DataItem)[key]?.toString().toLowerCase().includes(searchValue))
        );
      }
    }

    if (rangedFilters) {
      const parsedRange = JSON.parse(rangedFilters as string);
      for (const range of parsedRange) {
        const { key, start, end } = range;
        allDataFiles = allDataFiles.filter(item => {
          if (!item || typeof item !== 'object') return false;
          const value = (item as DataItem)[key];
          return value >= start && value <= end;
        });
      }
    }

    // Mengurutkan data sesuai dengan request yang tersedia, function ini membutuhkan orderRule dan orderKey
    const key = Array.isArray(orderKey) ? orderKey[0] : orderKey;
    if (key && typeof key === 'string') {
      const rule = orderRule === 'desc' ? -1 : 1;
      allDataFiles.sort((a, b) => {
        const valA = (a as DataItem)?.[key];
        const valB = (b as DataItem)?.[key];
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        return (valA > valB ? 1 : valA < valB ? -1 : 0) * rule;
      });
    }

    return {
      status: true,
      data: {
        data: allDataFiles,
        meta: {
          total,
          page: Number(page),
          perPage: Number(perPage),
          totalPages: Math.ceil(total / Number(perPage)),
        },
      }
    };
  } catch (err) {
    Logger.error(`FileService.get : ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function upload(req: Request, res: Response): Promise<ServiceResponse<{}>> {
    try {
      // pengecekan "module" yang dimana di wajibkan untuk ada
      let { module } = req.query;
      if (Array.isArray(module)) module = module[0];
      
      if (!module || typeof module !== 'string') {
        Logger.error(`FileService.upload : INVALID MODULE`);
        return INVALID_ID_SERVICE_RESPONSE;
      }

      const file = req.file;
      if (!file) {
        Logger.error(`FileService.upload : FILE NOT FOUND`)
        return INVALID_ID_SERVICE_RESPONSE
      }
  
      // Menyimpan dan membuat file Parent
      const newFile = await prisma.file.create({
        data: {
          filename: file.originalname,
          url: file.path,
          status: "pending",
          userId: req.user!.userId,
          module: module
        },
      });
  
      mockProcessFile(newFile.id, file.path);
  
      return {
        status:true,
        data:{ 
            message: "Upload received", 
            file: newFile
        }
    }
    } catch (err) {
        Logger.error(`ExampleService.get : ${err}`)
        return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
    }
}

export async function mockProcessFile(fileId: number, filePath: string) {
  setTimeout(async () => {
    try {
      // Mengambil data dari Excel lalu mengubah nya menjadi JSON
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Menyimpan dataFile kedalam data file parent, yang sudah di buat di atas  
      await prisma.file.update({
        where: { id: fileId },
        data: { 
            status: "success",
            dataFile: data,
        },
      });
    } catch (err) {
      // Mengubah status menjadi "Failed" jikalau terjadi kesalahan 
      await prisma.file.update({
        where: { id: fileId },
        data: { status: "failed" },
      });
    }
  }, 3000);
}

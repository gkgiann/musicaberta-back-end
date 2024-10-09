import { FastifyInstance } from "fastify";
import {
  CreateSheetDTO,
  DeleteSheetDTO,
  GetSheetByUserIdDTO,
  GetSheetsQueryDTO,
} from "./sheet.routes.dto";
import { prisma } from "../../../database/prisma";
import { SheetRepositoryPrisma } from "../../../repositories/sheet/prisma/sheet.repository.prisma";
import { SheetServiceImplementation } from "../../../services/sheet/sheet.service.implementation";
import { Sheet } from "../../../entities/sheet.entity";

export async function sheetRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateSheetDTO }>("/", async (req, reply) => {
    const { badges, mp3Url, pdfUrl, songWriter, title, userId } = req.body;

    const aRepository = SheetRepositoryPrisma.build(prisma);
    const aService = SheetServiceImplementation.build(aRepository);

    const aSheet = Sheet.build(
      title,
      songWriter,
      pdfUrl,
      mp3Url,
      badges,
      userId
    );

    const sheetCreated = await aService.create(aSheet);

    console.log(sheetCreated);

    return reply.status(201).send({ sheet: sheetCreated?.props });
  });

  fastify.get<{ Querystring: GetSheetsQueryDTO }>("/", async (req, reply) => {
    const { search, sort } = req.query;
    const page = Number(req.query.page);

    const perPage = 5;
    const skip = (page - 1) * perPage;

    const aRepository = SheetRepositoryPrisma.build(prisma);
    const aService = SheetServiceImplementation.build(aRepository);

    const { sheets, total } = await aService.findAll(
      search,
      sort || "desc",
      skip,
      perPage
    );

    const sheetsFormatted = sheets.map((sheet) => sheet.props);

    const lastPage = Math.ceil(total / perPage);

    const meta = {
      current: page,
      path: "/sheets",
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
      total,
    };

    return reply.status(200).send({
      data: sheetsFormatted,
      meta,
    });
  });

  fastify.get<{ Params: GetSheetByUserIdDTO }>(
    "/user/:id",
    async (req, reply) => {
      const { id } = req.params;

      const aRepository = SheetRepositoryPrisma.build(prisma);
      const aService = SheetServiceImplementation.build(aRepository);

      const result = await aService.findByUser(id);

      const sheets = result.map((sheet) => sheet.props);

      return reply.status(200).send({ sheets });
    }
  );

  fastify.delete<{ Params: DeleteSheetDTO }>("/:id", async (req, reply) => {
    const { id } = req.params;

    const aRepository = SheetRepositoryPrisma.build(prisma);
    const aService = SheetServiceImplementation.build(aRepository);

    await aService.delete(id);

    return reply.status(200).send({ message: "sheet deleted" });
  });
}

import express, { type Request, type Response} from 'express';
import { PrismaClient, Tiket } from '@prisma/client';
console.log(90000.0 * 10);
const app = express();
const db = new PrismaClient();
const api = express.Router();
const tiket_api = express.Router();
const pesan_tiket = express.Router();

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

tiket_api.post("/create", async (req, res) => {
    const tiket_data = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
    }

    try {
        const tiket = await db.tiket.create({
            data: tiket_data
        });

        res.json({
            error: false,
            message: "Tiket berhasil di buat.",
            data: tiket,
        });
    }catch(e){
        res.json({
            error: true,
            message: "Tiket gagal di buat",
            data: e.toString(),
        });
    }
});

tiket_api.post("/update", async (req, res) => {
    const tiket_data = {
        id: req.body.id,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
    }

    try {
        const { id, ...restData} = tiket_data;
        const tiket = await db.tiket.update({
            where: {
                ID: tiket_data.id,
            },
            data: restData,
        });

        res.json({
            error: false,
            message: "Tiket berhasil di ubah.",
            data: tiket,
        });
    }catch(e){
        res.status(500).json({
            error: true,
            message: "Tiket gagal di ubah",
            data: e.toString(),
        });
    }
});

tiket_api.delete("/delete", async (req, res) => {
    const tiket_data = {
        id: req.body.id,
    }

    try {
        const tiket = await db.tiket.delete({
            where: {
                ID: tiket_data.id,
            },
        })

        res.json({
            error: false,
            message: "Tiket berhasil di hapus.",
            data: tiket,
        });
    }catch(e){
        res.status(400).json({
            error: true,
            message: "Tiket gagal di hapus",
            data: {
                status: 400,
                code: 5000,
                reason: "Invalid input ...."
            }
        });
    }
});

tiket_api.get("/all", async (req, res) => {
    const tiket = await db.tiket.findMany();
    res.json({
        error: false,
        message: "",
        data: tiket
    });
});


pesan_tiket.post("/create", async (req, res) => {
    try {
        const order = await db.$transaction(async (tx) => {
            const listTiket: {id: number, price: number, quantity: number}[] = []
            let total = 0;
            for(const tiketId of req.body.tiketIds){
                const tiket = await tx.tiket.findFirst({
                    where: {
                        ID: tiketId.id,
                    },
                    select: {
                        ID: true,
                        price: true,
                    }
                });
                let subtotal = (tiket?.price??0) * tiketId.quantity;
                total += subtotal;
                console.log(total, subtotal);
                if(tiket) listTiket.push({ id: tiket.ID, price: tiket.price, quantity: tiketId.quantity});
            }

            const order = await tx.sale.create({
                data: {
                    customer: req.body.customerId,
                    total: total,
                    name: req.body.name,
                }
            })

            for(const data of listTiket){
                await tx.saleOrder.create({
                    data: {
                        saleId: order.ID,
                        tiketId: data.id,
                        quantity: data.quantity,
                        price: data.price
                    }
                })
            }

            return await db.sale.findFirst({ where: { ID: order.ID }});
        });

        res.json({
            error: false,
            message: "Tiket berhasil di buat.",
            data: order,
        });
    }catch(e){
        res.json({
            error: true,
            message: "Tiket gagal di buat",
            data: e.toString(),
        });
    }
});

pesan_tiket.get("/order", async (req, res) => {
    const order = await db.sale.findMany({
        include: {
            saleOrders: {
                include: {
                    tiket: true,
                }
            }
        }
    });
    res.json({
        error: false,
        message: "",
        data: order,
    })
})

api.get("/", (req, res) => {
    res.json({
        error: false,
        message: "",
        data:null,
    })
});

// api pemesanan
api.use("/pesan", pesan_tiket);
// api CRUD pengelolaan tiket
api.use("/tiket", tiket_api);
// api route
app.use("/api", api);

app.listen(3000, () => {
    console.info("App started on port 3000");
});
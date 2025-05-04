import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  message,
  Select,
  Layout,
  Menu,
  Table,
  AutoComplete,
  Switch,
  Drawer,
} from "antd";
import { Popconfirm } from "antd";
import "antd/dist/reset.css";
import "./admin.css";
import {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "../../context/service/addproduct.service";
import {
  PlusOutlined,
  UserAddOutlined,
  BarChartOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  ShopOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Adminlar from "../Adminlar/Adminlar";
import Sotuv_tarix from "../sotuv-tarix/Sotuv_tarix";
import Qarzdor from "../qarzdorlar/Qarzdor";
import StoreItem from "../Store/StoreItem";
import Xisobot from "../Xisobod/Xisobot";
import EditProductModal from "../../components/modal/Editmodal";
import {
  useGetUsdRateQuery,
  useUpdateUsdRateMutation,
} from "../../context/service/usd.service";
import PrintBarcodeModal from "../../components/print/PrintBarcodeModal";
import { useAddProductToStoreMutation } from "../../context/service/store.service";
import PrintButton from "./PrintButton";
import SalesStatistics from "../SalesStatistics/SalesStatistics";
import { FaPrint } from "react-icons/fa";
import { BiTransfer } from "react-icons/bi";

const { Sider, Content, Header } = Layout;
const { Option } = Select;

export const Admin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // For mobile sidebar
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();
  const [createProduct] = useCreateProductMutation();
  const { data, isLoading, refetch } = useGetAllProductsQuery();
  const [barcode, setBarcode] = useState("");
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [addProductToStore] = useAddProductToStoreMutation();
  const access = JSON.parse(localStorage.getItem("acsess"));
  const [editingProduct, setEditingProduct] = useState(null);
  const [totalProfit, setTotalProfit] = useState(0);
  const { data: usdRateData } = useGetUsdRateQuery();
  const [updateUsdRate] = useUpdateUsdRateMutation();
  const [usdRate, setUsdRate] = useState(usdRateData?.rate || 1);
  const [selectedMenuKey, setSelectedMenuKey] = useState("1");

  const [productNames, setProductNames] = useState([]);
  const [kimdan_kelgan, setkimdan_kelgan] = useState([]);
  const [models, setModels] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [purchaseSum, setPurchaseSum] = useState(true);
  const [sellSum, setSellSum] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (usdRateData) {
      setUsdRate(usdRateData.rate);
    }
  }, [usdRateData]);

  useEffect(() => {
    if (data) {
      const profit = data.reduce((acc, product) => {
        const productProfit =
          (product.sell_price - product.purchase_price) * product.stock;
        return acc + productProfit;
      }, 0);
      setTotalProfit(profit);

      const uniqueProductNames = [
        ...new Set(data.map((product) => product.product_name)),
      ];
      setProductNames(uniqueProductNames.sort());

      const uniqueModels = [...new Set(data.map((product) => product.model))];
      setModels(uniqueModels);

      const uniquekimdan_kelgan = [
        ...new Set(data.map((product) => product.kimdan_kelgan)),
      ];
      setkimdan_kelgan(uniquekimdan_kelgan);
    }
  }, [data]);

  useEffect(() => {
    if (isModalOpen) {
      const generateBarcode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setBarcode(code);
      };
      generateBarcode();
    }
  }, [isModalOpen]);

  const handleUsdRateChange = async () => {
    try {
      await updateUsdRate(usdRate).unwrap();
      message.success("USD kursi muvaffaqiyatli yangilandi!");
      refetch();
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  useEffect(() => {
    refetch();
  }, [usdRate]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      const productData = {
        ...values,
        barcode,
        purchase_currency: purchaseSum ? "uzs" : "usd",
        sell_currency: sellSum ? "uzs" : "usd",
      };

      await createProduct(productData).unwrap();
      message.success("Mahsulot muvaffaqiyatli qo'shildi!");

      setIsModalOpen(false);
      form.resetFields();
      refetch();
      window.location.reload();
    } catch (error) {
      message.error("Xato yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  const showPrintModal = (barcode) => {
    setBarcode(barcode);
    setIsPrintModalOpen(true);
  };

  const handlePrintModalClose = () => {
    setIsPrintModalOpen(false);
  };

  const showEditModal = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    refetch();
  };

  const showTransferModal = (product) => {
    setSelectedProduct(product);
    setIsTransferModalOpen(true);
  };

  const handleTransferCancel = () => {
    setIsTransferModalOpen(false);
    setSelectedProduct(null);
    form.resetFields();
  };

  const handleAddToStore = async (values) => {
    try {
      await addProductToStore({
        product_id: selectedProduct._id,
        quantity: values.quantity,
      }).unwrap();
      message.success("Mahsulot do'konga muvaffaqiyatli o'tkazildi!");
      setIsTransferModalOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      message.error("Mahsulotni do'konga o'tkazishda xatolik yuz berdi");
    }
  };

  const columns = [
    { title: "Mahsulot nomi", dataIndex: "product_name", key: "product_name" },
    { title: "Modeli", dataIndex: "model", key: "model" },
    {
      title: "Miqdor",
      dataIndex: "stock",
      key: "stock",
      render: (text) => (
        <div
          style={{
            backgroundColor:
              text === 0 ? "red" : text <= 5 ? "yellow" : "inherit",
            padding: "8px",
            textAlign: "center",
          }}
        >
          {Number(text).toLocaleString()}
        </div>
      ),
    },
    {
      title: "Olish narxi",
      dataIndex: "purchase_price",
      key: "purchase_price",
      render: (text, record) =>
        `${text.toFixed(2)}${record.purchase_currency === "usd" ? "$" : "so'm"}`,
    },
    {
      title: "Sotish narxi",
      dataIndex: "sell_price",
      key: "sell_price",
      render: (text, record) =>
        `${text.toFixed(2)}${record.sell_currency === "usd" ? "$" : "so'm"}`,
    },
    { title: "O'lchov birligi", dataIndex: "count_type", key: "count_type" },
    {
      title: "Shtrix kod",
      dataIndex: "barcode",
      key: "barcode",
      render: (barcode) => (
        <div>
          <Button
            onClick={() => showPrintModal(barcode)}
            type="primary"
            style={{ marginRight: "10px" }}
          >
            <FaPrint />
          </Button>
        </div>
      ),
    },
    {
      title: "kimdan_kelgan",
      dataIndex: "kimdan_kelgan",
      key: "kimdan_kelgan",
    },
    {
      title: "Umumiy Narxi",
      key: "total_price",
      render: (_, record) => {
        const totalPrice = record.sell_price * record.stock;
        return `${totalPrice.toFixed(2)} ${record.sell_currency === "usd" ? "$" : "so'm"}`;
      },
    },
    {
      title: "Foyda",
      key: "profit",
      render: (_, record) => {
        const profit =
          (record.sell_price - record.purchase_price) * record.stock;
        return `${profit.toFixed(2)} ${record.sell_currency === "usd" ? "$" : "so'm"}`;
      },
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <Button
            type="primary"
            onClick={() => showEditModal(record)}
            size={isMobile ? "small" : "middle"}
          >
            <EditOutlined />
          </Button>
          <Button
            type="primary"
            onClick={() => showTransferModal(record)}
            size={isMobile ? "small" : "middle"}
          >
            <BiTransfer />
          </Button>
          <Popconfirm
            title="Haqiqatdan ham ushbu mahsulotni o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button type="primary" danger size={isMobile ? "small" : "middle"}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Mahsulot muvaffaqiyatli o'chirildi!");
      refetch();
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  const rowClassName = (record) => {
    if (record.stock === 0) {
      return "red-row";
    } else if (record.stock <= 5) {
      return "yellow-row";
    } else {
      return "";
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (value) => {
    setStockFilter(value);
  };

  const filteredData = data
    ?.filter((product) => {
      if (stockFilter === "all") return true;
      if (stockFilter === "runningOut")
        return product.stock <= 5 && product.stock > 0;
      if (stockFilter === "outOfStock") return product.stock === 0;
      return true;
    })
    .filter(
      (product) =>
        product.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.model.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => a.stock - b.stock);

  const menuItems = [
    access?.dokon && {
      key: "1",
      icon: <ShopOutlined />,
      label: "Dokon",
    },
    access?.adminlar && {
      key: "2",
      icon: <UserAddOutlined />,
      label: "Admin qo'shish",
    },
    access?.qarzdorlar && {
      key: "3",
      icon: <TeamOutlined />,
      label: "Qarzdorlar",
    },
    access?.xisobot && {
      key: "4",
      icon: <BarChartOutlined />,
      label: "Xisobot",
    },
    access?.sotuv_tarixi && {
      key: "5",
      icon: <HistoryOutlined />,
      label: "Sotuv",
    },
    access?.SalesStatistics && {
      key: "6",
      icon: <BarChartOutlined />,
      label: "statistika",
    },
    access?.skaladorlar && {
      key: "7",
      icon: <UserAddOutlined />,
      label: "Sklad tavar qo'shish",
    },
  ].filter(Boolean);

  const renderContent = () => {
    switch (selectedMenuKey) {
      case "1":
        return <StoreItem />;
      case "2":
        return <Adminlar />;
      case "3":
        return <Qarzdor />;
      case "4":
        return <Xisobot />;
      case "5":
        return <Sotuv_tarix />;
      case "6":
        return <SalesStatistics />;
      case "7":
        return (
          <>
            <div className="admin-buttons">
              <Button
                type="primary"
                onClick={showModal}
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
                icon={<PlusOutlined />}
              >
                Omborga Mahsulot qo'shish +
              </Button>
              <div className="search-filter-container">
                <Input.Search
                  placeholder="Mahsulot nomi yoki modeli..."
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: isMobile ? "100%" : 200 }}
                />
                <Select
                  defaultValue="all"
                  style={{ width: isMobile ? "100%" : 150 }}
                  onChange={handleFilterChange}
                >
                  <Option value="all">Barcha mahsulotlar</Option>
                  <Option value="runningOut">Tugayotgan mahsulotlar</Option>
                  <Option value="outOfStock">Tugagan mahsulotlar</Option>
                </Select>
              </div>
            </div>
            <div className="table-container">
              <Table
                dataSource={filteredData?.filter(
                  (st) => st?.storeProduct != true
                )}
                loading={isLoading}
                columns={columns}
                pagination={{ pageSize: 20 }}
                rowClassName={rowClassName}
                scroll={{ x: "max-content" }}
                size={isMobile ? "small" : "middle"}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="main-layout">
      {/* Desktop Sidebar - fixed position */}
      <Sider
        width={200}
        style={{
          background: "#1a2a6c",
          position: "fixed",
          height: "100vh",
          left: 0,
          zIndex: 100,
          overflow: "auto"
        }}
        className="desktop-sider"
      >
        <div style={{ padding: "20px", textAlign: "center", color: "white" }}>
          <h2 className="shu__brend__logo">SHU BREND</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenuKey]}
          onClick={(e) => {
            setSelectedMenuKey(e.key);
          }}
          style={{ background: "#1a2a6c", color: "white", borderRight: 0 }}
          items={menuItems}
        />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title="SHU BREND"
        placement="left"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        className="mobile-drawer"
        width={250}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedMenuKey]}
          onClick={(e) => {
            setSelectedMenuKey(e.key);
            setIsDrawerOpen(false);
          }}
          style={{ background: "#fff", color: "#1a2a6c" }}
          items={menuItems}
        />
      </Drawer>

      {/* Main Layout */}
      <Layout className="site-layout" style={{ marginLeft: isMobile ? 0 : 200 }}>
        <Header
          className="site-header"
          style={{
            padding: "0 16px",
            background: "#1a2a6c",
            position: "sticky",
            top: 0,
            zIndex: 99,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setIsDrawerOpen(true)}
              style={{ color: "white" }}
              className="mobile-menu-button"
            />
          )}
          <div style={{ color: "white", fontWeight: "bold" }}>
            {menuItems.find(item => item?.key === selectedMenuKey)?.label}
          </div>
          <div></div> {/* Empty div for flex spacing */}
        </Header>

        <Content
          style={{
            padding: isMobile ? "12px" : "24px",
            background: "#f0f2f5",
            minHeight: "calc(100vh - 64px)",
            overflow: "initial"
          }}
        >
          {renderContent()}

          <Modal
            title="Mahsulot yaratish"
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={isMobile ? "95%" : 600}
            centered
          >
            <Form layout="vertical" form={form} onFinish={handleFinish}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mahsulot nomi"
                    name="product_name"
                    rules={[{ required: true, message: "Majburiy maydon!" }]}
                  >
                    <AutoComplete
                      options={productNames.map((name) => ({
                        value: name,
                      }))}
                      placeholder="Mahsulot nomi"
                      filterOption={(inputValue, option) =>
                        option.value
                          .toLowerCase()
                          .indexOf(inputValue.toLowerCase()) !== -1
                      }
                    >
                      <Input placeholder="Mahsulot nomi" autoComplete="off" />
                    </AutoComplete>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Model"
                    name="model"
                    rules={[{ required: true, message: "Majburiy maydon!" }]}
                  >
                    <AutoComplete
                      options={models.map((model) => ({
                        value: model,
                      }))}
                      placeholder="Model"
                      filterOption={(inputValue, option) =>
                        option.value
                          .toLowerCase()
                          .indexOf(inputValue.toLowerCase()) !== -1
                      }
                    >
                      <Input placeholder="Model" autoComplete="off" />
                    </AutoComplete>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Miqdor"
                    name="stock"
                    rules={[{ required: true, message: "Majburiy maydon!" }]}
                  >
                    <Input
                      type="number"
                      placeholder="Miqdor"
                      autoComplete="off"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="O'lchov birligi"
                    name="count_type"
                    rules={[{ required: true, message: "Majburiy maydon!" }]}
                  >
                    <Select placeholder="O'lchov birligi" autoComplete="off">
                      <Option value="dona">Dona</Option>
                      <Option value="komplekt">Komplekt</Option>
                      <Option value="metr">Metr</Option>
                      <Option value="cm">Santimetr</Option>
                      <Option value="litre">Litr</Option>
                      <Option value="kg">Kilogramm</Option>
                      <Option value="m2">Kvadrat metr</Option>
                      <Option value="m3">Kub metr</Option>
                      <Option value="gramm">Gramm</Option>
                      <Option value="tonna">Tonna</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Sotib olish narxi"
                    name="purchase_price"
                    rules={[{ required: true, message: "Majburiy maydon!" }]}
                  >
                    <Input
                      type="number"
                      placeholder="Sotib olish narxi"
                      autoComplete="off"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Sotish narxi"
                    name="sell_price"
                    rules={[{ required: true, message: "Majburiy maydon!" }]}
                  >
                    <Input
                      type="number"
                      placeholder="Sotish narxi"
                      autoComplete="off"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <p>USD</p>
                    <Switch
                      checked={purchaseSum}
                      onChange={() => setPurchaseSum(!purchaseSum)}
                    />
                    <p>UZS</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <p>USD</p>
                    <Switch
                      checked={sellSum}
                      onChange={() => setSellSum(!sellSum)}
                    />
                    <p>UZS</p>
                  </div>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Kimdan kelgan"
                    name="kimdan_kelgan"
                    rules={[{ required: true, message: "Majburiy maydon!" }]}
                  >
                    <Input placeholder="Kimdan kelgan" autoComplete="off" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Saqlash
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Mahsulotni dokonga o'tkazish"
            open={isTransferModalOpen}
            onCancel={handleTransferCancel}
            footer={null}
            width={isMobile ? "95%" : 400}
            centered
          >
            <Form layout="vertical" form={form} onFinish={handleAddToStore}>
              <Form.Item
                label="Miqdor"
                name="quantity"
                rules={[{ required: true, message: "Majburiy maydon!" }]}
              >
                <Input type="number" placeholder="Miqdor" autoComplete="off" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Dokonga o'tkazish
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <EditProductModal
            visible={isEditModalOpen}
            onCancel={handleEditComplete}
            product={editingProduct}
            usdRate={usdRate}
          />

          <PrintBarcodeModal
            visible={isPrintModalOpen}
            onCancel={handlePrintModalClose}
            barcode={barcode}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
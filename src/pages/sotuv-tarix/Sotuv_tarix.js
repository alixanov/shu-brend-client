import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  DatePicker,
  Select,
  Statistic,
  Row,
  Col,
  Button,
} from "antd";
import { useGetSalesHistoryQuery } from "../../context/service/sale.service";
import { useGetExpensesQuery } from "../../context/service/harajatlar.service";
import { useGetUsdRateQuery } from "../../context/service/usd.service";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function SotuvTarix() {
  const { data: sales, isLoading } = useGetSalesHistoryQuery();
  const { data: harajatData } = useGetExpensesQuery();
  const { data: usdRate } = useGetUsdRateQuery();
  const [isMobile, setIsMobile] = useState(false);

  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [paymentMethod, setPaymentMethod] = useState("");

  const currentRate = usdRate?.rate || 13000;

  // Check if the screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onDateChange = (dates) => {
    setSelectedDateRange(dates);
    filterSales(dates, paymentMethod);
  };

  const onPaymentMethodChange = (value) => {
    setPaymentMethod(value);
    filterSales(selectedDateRange, value);
  };

  const filterSales = (dates, payment) => {
    let filtered = sales || [];
    if (dates && dates[0] && dates[1]) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= dates[0] && saleDate <= dates[1];
      });
    }
    if (payment) {
      filtered = filtered.filter((sale) => sale.payment_method === payment);
    }
    setFilteredSales(filtered);
  };

  const totalAmount =
    filteredSales?.reduce((acc, sale) => acc + sale.total_price, 0) || 0;

  const weeklyAmount =
    filteredSales
      ?.filter(
        (sale) =>
          new Date(sale.createdAt) >=
          new Date(new Date().setDate(new Date().getDate() - 7))
      )
      .reduce((acc, sale) => acc + sale.total_price, 0) || 0;

  const dailyAmount =
    filteredSales
      ?.filter(
        (sale) =>
          new Date(sale.createdAt).toLocaleDateString() ===
          new Date().toLocaleDateString()
      )
      .reduce((acc, sale) => acc + sale.total_price, 0) || 0;

  const totalCost =
    filteredSales?.reduce((acc, sale) => {
      const buyPrice = sale?.buy_price || 0;
      const quantity = sale?.quantity || 0;
      const purchaseCurrency = sale?.product_id?.purchase_currency || "uzs";
      const saleUsdRate = sale?.usd_rate || currentRate;

      const convertedBuyPrice =
        purchaseCurrency === "usd" ? buyPrice * saleUsdRate : buyPrice;
      const cost = convertedBuyPrice * quantity;
      return acc + cost;
    }, 0) || 0;

  const weeklyCost =
    filteredSales
      ?.filter(
        (sale) =>
          new Date(sale.createdAt) >=
          new Date(new Date().setDate(new Date().getDate() - 7))
      )
      .reduce((acc, sale) => {
        const buyPrice = sale?.buy_price || 0;
        const quantity = sale?.quantity || 0;
        const purchaseCurrency = sale?.product_id?.purchase_currency || "uzs";
        const saleUsdRate = sale?.usd_rate || currentRate;

        const convertedBuyPrice =
          purchaseCurrency === "usd" ? buyPrice * saleUsdRate : buyPrice;
        const cost = convertedBuyPrice * quantity;
        return acc + cost;
      }, 0) || 0;

  const dailyCost =
    filteredSales
      ?.filter(
        (sale) =>
          new Date(sale.createdAt).toLocaleDateString() ===
          new Date().toLocaleDateString()
      )
      .reduce((acc, sale) => {
        const buyPrice = sale?.buy_price || 0;
        const quantity = sale?.quantity || 0;
        const purchaseCurrency = sale?.product_id?.purchase_currency || "uzs";
        const saleUsdRate = sale?.usd_rate || currentRate;

        const convertedBuyPrice =
          purchaseCurrency === "usd" ? buyPrice * saleUsdRate : buyPrice;
        const cost = convertedBuyPrice * quantity;
        return acc + cost;
      }, 0) || 0;

  const totalExpenses =
    harajatData
      ?.filter(
        (item) =>
          (!selectedDateRange[0] ||
            new Date(item.created_at).getTime() >=
            selectedDateRange[0].startOf("day").toDate().getTime()) &&
          (!selectedDateRange[1] ||
            new Date(item.created_at).getTime() <=
            selectedDateRange[1].endOf("day").toDate().getTime())
      )
      .reduce((a, b) => a + (b?.payment_summ || 0), 0) || 0;

  const weeklyExpenses =
    harajatData
      ?.filter(
        (item) =>
          new Date(item.created_at) >=
          new Date(new Date().setDate(new Date().getDate() - 7))
      )
      .reduce((a, b) => a + (b?.payment_summ || 0), 0) || 0;

  const dailyExpenses =
    harajatData
      ?.filter(
        (item) =>
          new Date(item.created_at).toLocaleDateString() ===
          new Date().toLocaleDateString()
      )
      .reduce((a, b) => a + (b?.payment_summ || 0), 0) || 0;

  const totalProfit = totalAmount - totalCost - totalExpenses;
  const weeklyProfit = weeklyAmount - weeklyCost - weeklyExpenses;
  const dailyProfit = dailyAmount - dailyCost - dailyExpenses;

  useEffect(() => {
    setFilteredSales(sales || []);
  }, [sales]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const showDailySales = () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    filterSales([startOfDay, endOfDay], paymentMethod);
  };

  // Define columns based on screen size
  const getColumns = () => {
    // For mobile devices, only show product name and price
    if (isMobile) {
      return [
        {
          title: "Mahsulot nomi",
          dataIndex: "product_name",
          key: "product_name",
        },
        {
          title: "Narxi",
          dataIndex: "sell_price",
          key: "sell_price",
          render: (text) => `${formatNumber(text)} so'm`,
        },
      ];
    }

    // For desktop, show all columns
    return [
      {
        title: "Mahsulot nomi",
        dataIndex: "product_name",
        key: "product_name",
      },
      {
        title: "Model",
        dataIndex: ["product_id", "model"],
        key: "model",
        render: (text, record) => `${record.product_id?.model || "N/A"}`,
      },
      {
        title: "Narxi",
        dataIndex: "sell_price",
        key: "sell_price",
        render: (text) => `${formatNumber(text)} so'm`,
      },
      { title: "Soni", dataIndex: "quantity", key: "quantity" },
      {
        title: "Umumiy narxi",
        key: "total_price",
        render: (_, record) =>
          `${formatNumber(record.sell_price * record.quantity)} so'm`,
      },
      {
        title: "Xarid narxi",
        key: "cost",
        render: (_, record) => {
          const buyPrice = record?.buy_price || 0;
          const quantity = record?.quantity || 0;
          const purchaseCurrency =
            record?.product_id?.purchase_currency || "uzs";
          const saleUsdRate = record?.usd_rate || currentRate;

          const convertedBuyPrice =
            purchaseCurrency === "usd" ? buyPrice * saleUsdRate : buyPrice;
          const cost = convertedBuyPrice * quantity;
          return `${formatNumber(cost)} so'm`;
        },
      },
      {
        title: "Foyda",
        key: "profit",
        render: (_, record) => {
          const sellPrice = record?.sell_price || 0;
          const buyPrice = record?.buy_price || 0;
          const quantity = record?.quantity || 0;
          const purchaseCurrency =
            record?.product_id?.purchase_currency || "uzs";
          const saleUsdRate = record?.usd_rate || currentRate;

          const convertedBuyPrice =
            purchaseCurrency === "usd" ? buyPrice * saleUsdRate : buyPrice;
          const profit = (sellPrice - convertedBuyPrice) * quantity;
          return `${formatNumber(profit)} so'm`;
        },
      },
      {
        title: "To'lov usuli",
        dataIndex: "payment_method",
        key: "payment_method",
      },
      {
        title: "Sotilgan sana",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (text) => new Date(text).toLocaleString(),
      },
    ];
  };

  return (
    <Card
      title="Sotuvlar tarixi"
      bordered={false}
      className="m-4 w-full md:m-5"
    >
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-5">
        <RangePicker
          onChange={onDateChange}
          className="w-full md:w-auto"
        />
        <Select
          placeholder="To'lov usulini tanlang"
          onChange={onPaymentMethodChange}
          className="w-full md:w-[200px]"
        >
          <Option value="">Barchasi</Option>
          <Option value="naqd">Naqd</Option>
          <Option value="plastik">Karta</Option>
        </Select>
        <Button
          type="primary"
          onClick={showDailySales}
          className="w-full md:w-auto"
        >
          Bir kunlik savdo
        </Button>
      </div>

      <Row
        gutter={[16, 16]}
        className="mb-5"
      >
        <Col
          xs={24}
          sm={12}
          md={8}
        >
          <Statistic
            title="Umumiy summa"
            value={`${formatNumber(totalAmount)} so'm`}
          />
        </Col>
        <Col
          xs={24}
          sm={12}
          md={8}
        >
          <Statistic
            title="Haftalik summa"
            value={`${formatNumber(weeklyAmount)} so'm`}
          />
        </Col>
        <Col
          xs={24}
          sm={12}
          md={8}
        >
          <Statistic
            title="Kunlik summa"
            value={`${formatNumber(dailyAmount)} so'm`}
          />
        </Col>
      </Row>

      <Row
        gutter={[16, 16]}
        className="mb-5"
      >
        <Col
          xs={24}
          sm={12}
          md={8}
        >
          <Statistic
            title="Umumiy foyda"
            value={`${formatNumber(totalProfit)} so'm`}
          />
        </Col>
        <Col
          xs={24}
          sm={12}
          md={8}
        >
          <Statistic
            title="Haftalik foyda"
            value={`${formatNumber(weeklyProfit)} so'm`}
          />
        </Col>
        <Col
          xs={24}
          sm={12}
          md={8}
        >
          <Statistic
            title="Kunlik foyda"
            value={`${formatNumber(dailyProfit)} so'm`}
          />
        </Col>
      </Row>

      <div className="overflow-x-auto">
        <Table
          dataSource={filteredSales}
          loading={isLoading}
          className="w-full"
          columns={getColumns()}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell
                colSpan={isMobile ? 2 : 5}
                align="right"
              ></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>
    </Card>
  );
}